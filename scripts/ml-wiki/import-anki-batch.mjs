/**
 * Pull the next N notes from Anki (after a cursor note ID) and merge wiki topics.
 *
 * Usage:
 *   node scripts/ml-wiki/import-anki-batch.mjs --after 1771711352419 --count 5 --pull \
 *     --deck "Machine Learning by Henrik Nordberg"
 *
 * Or merge from a JSON snapshot (same shape as import-from-notes.mjs):
 *   node scripts/ml-wiki/import-anki-batch.mjs --after 1771711352419 --count 5 --input notes.json
 *
 * Requires AnkiConnect on http://127.0.0.1:8765 for --pull.
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  normalizeCitationText,
  prepareBackHtml,
  summaryFromSections,
  transformDeckNoteHtml,
} from "./lib/deck-to-wiki.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const topicsPath = join(root, "src", "app", "ml", "wiki", "content", "topics.json");
const manifestPath = join(root, "src", "app", "ml", "wiki", "content", "manifest.json");

const ANKI_URL = process.env.ANKI_CONNECT_URL || "http://127.0.0.1:8765";
const SOURCE_DECK = "Machine Learning by Henrik Nordberg";

const WIKI_TAG = /^ml-wiki:([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const DOMAIN_TAG = /^ml-domain:(.+)$/;
const LEVEL_TAG = /^ml-level:(.+)$/;
const TYPE_TAG = /^ml-type:(.+)$/;

const DOMAINS = new Set([
  "math",
  "foundations",
  "supervised",
  "unsupervised",
  "deep-learning",
  "llm",
  "evaluation",
  "history",
  "other",
]);
const LEVELS = new Set(["intro", "intermediate", "advanced"]);
const TYPES = new Set([
  "definition",
  "intuition",
  "proof",
  "example",
  "pitfall",
  "mixed",
]);

function parseArgs(argv) {
  const out = {
    after: null,
    count: null,
    input: null,
    pull: false,
    deck: SOURCE_DECK,
    dryRun: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--after") out.after = BigInt(argv[++i]);
    else if (a === "--count") out.count = Number(argv[++i], 10);
    else if (a === "--input") out.input = argv[++i];
    else if (a === "--deck") out.deck = argv[++i];
    else if (a === "--pull") out.pull = true;
    else if (a === "--dry-run") out.dryRun = true;
    else {
      console.error(`Unknown arg: ${a}`);
      process.exit(2);
    }
  }
  if (out.after == null || !out.count || out.count < 1) {
    console.error(
      "Usage: node import-anki-batch.mjs --after <noteId> --count <n> (--pull [--deck \"...\"] | --input notes.json) [--dry-run]"
    );
    process.exit(2);
  }
  if (out.pull === !!out.input) {
    console.error("Specify exactly one of --pull or --input <file.json>");
    process.exit(2);
  }
  return out;
}

async function ankiInvoke(action, params = {}) {
  const payload = { action, version: 6, params };
  const res = await fetch(ANKI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`AnkiConnect HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`AnkiConnect: ${data.error}`);
  return data.result;
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeBasicEntities(s) {
  return s
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function slugifyFromTitle(title) {
  const plain = decodeBasicEntities(stripHtml(title));
  const t = plain
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return t || "topic";
}

function pickWikiSlugFromTags(tags) {
  for (const t of tags) {
    const m = t.match(WIKI_TAG);
    if (m) return m[1];
  }
  return null;
}

function pickEnumTag(tags, re, allowed, fallback) {
  for (const t of tags) {
    const m = t.match(re);
    if (m && allowed.has(m[1])) return m[1];
  }
  return fallback;
}

function inferDomain(tags) {
  const d = pickEnumTag(tags, DOMAIN_TAG, DOMAINS, null);
  if (d) return d;
  const set = new Set(tags.map((x) => String(x).toLowerCase()));
  if (set.has("landmark")) return "history";
  if (set.has("foundational") && set.has("theory") && !set.has("transformer"))
    return "foundations";
  if (set.has("implementation")) return "deep-learning";
  return "llm";
}

function inferLevel(tags) {
  const lv = pickEnumTag(tags, LEVEL_TAG, LEVELS, null);
  if (lv) return lv;
  const set = new Set(tags.map((x) => String(x).toLowerCase()));
  if (set.has("advanced")) return "advanced";
  if (set.has("intermediate")) return "intermediate";
  if (set.has("foundational")) return "intro";
  return "intermediate";
}

function inferType(tags) {
  return pickEnumTag(tags, TYPE_TAG, TYPES, "mixed");
}

function topicTagsFromNoteTags(tags) {
  const out = new Set();
  for (const t of tags) {
    if (WIKI_TAG.test(t) || DOMAIN_TAG.test(t) || LEVEL_TAG.test(t) || TYPE_TAG.test(t))
      continue;
    out.add(t);
  }
  out.add("wiki-import");
  return [...out].sort();
}

function uniqueSlug(base, used) {
  let s = base;
  let n = 2;
  while (used.has(s)) {
    s = `${base}-${n++}`;
  }
  used.add(s);
  return s;
}

function relatedRing(slugs, i) {
  const n = slugs.length;
  if (n < 2) return [];
  const next = slugs[(i + 1) % n];
  const prev = slugs[(i + n - 1) % n];
  return [next, prev];
}

function noteToTopic(note, slug, allSlugsInBatch) {
  const noteId = Number(note.noteId);
  const tags = Array.isArray(note.tags) ? note.tags : [];
  const fields = note.fields && typeof note.fields === "object" ? note.fields : {};
  const front = fields.Front ?? fields.front ?? "";
  const backRaw = fields.Back ?? fields.back ?? "";

  const title = decodeBasicEntities(stripHtml(front)) || `Note ${noteId}`;
  const rawHtml = prepareBackHtml(backRaw, noteId);
  const { sections, footerText, footerUrl } = transformDeckNoteHtml(rawHtml);
  const summary =
    summaryFromSections(sections) || `Imported note ${noteId}: ${title}.`;

  const rawCitation = footerText.trim() || title;
  const citation = normalizeCitationText(rawCitation) || title;
  const papers = [
    {
      citation,
      ...(footerUrl ? { url: footerUrl } : {}),
    },
  ];

  const idx = allSlugsInBatch.indexOf(slug);
  const related = relatedRing(allSlugsInBatch, idx);

  return {
    slug,
    title,
    summary,
    domain: inferDomain(tags),
    level: inferLevel(tags),
    type: inferType(tags),
    tags: topicTagsFromNoteTags(tags),
    prerequisites: [],
    related,
    updatedAt: new Date().toISOString().slice(0, 10),
    sourceDeck: SOURCE_DECK,
    papers,
    sections,
    cards: [],
  };
}

function manifestEntry(t) {
  return {
    slug: t.slug,
    title: t.title,
    summary: t.summary,
    domain: t.domain,
    level: t.level,
    type: t.type,
    tags: t.tags,
    prerequisites: t.prerequisites,
    related: t.related,
    updatedAt: t.updatedAt,
    sourceDeck: t.sourceDeck,
  };
}

async function pullNotesFromAnki(deck, afterBig, count) {
  const query = `deck:"${deck.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  const ids = await ankiInvoke("findNotes", { query });
  if (!Array.isArray(ids) || !ids.length) {
    throw new Error(`findNotes returned no ids for ${query}`);
  }
  const sorted = [...ids]
    .map((id) => BigInt(id))
    .filter((id) => id > afterBig)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const chosen = sorted.slice(0, count);
  if (chosen.length < count) {
    console.warn(
      `Only ${chosen.length} note(s) after ${afterBig} (requested ${count}).`
    );
  }
  if (!chosen.length) return [];
  const infos = await ankiInvoke("notesInfo", {
    notes: chosen.map((x) => Number(x)),
  });
  const notes = [];
  for (const info of infos) {
    const front = info.fields?.Front?.value ?? "";
    const back = info.fields?.Back?.value ?? "";
    notes.push({
      noteId: String(info.noteId),
      tags: info.tags ?? [],
      fields: { Front: front, Back: back },
    });
  }
  return notes;
}

function loadNotesFromJson(path, afterBig, count) {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const arr = Array.isArray(raw.notes) ? raw.notes : raw;
  if (!Array.isArray(arr)) throw new Error("Input must be { notes: [...] } or array");
  const sorted = arr
    .map((n) => ({
      ...n,
      _id: BigInt(n.noteId ?? n.id),
    }))
    .filter((n) => n._id > afterBig)
    .sort((a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0));
  return sorted.slice(0, count).map(({ _id, ...rest }) => rest);
}

function assignSlugs(notes, existingSlugs) {
  const used = new Set(existingSlugs);
  const slugs = [];
  for (const note of notes) {
    const tags = Array.isArray(note.tags) ? note.tags : [];
    const front = note.fields?.Front ?? note.fields?.front ?? "";
    const fromTag = pickWikiSlugFromTags(tags);
    const base = fromTag || slugifyFromTitle(front);
    slugs.push(uniqueSlug(base, used));
  }
  return slugs;
}

async function main() {
  const args = parseArgs(process.argv);
  const afterBig = args.after;

  let notes;
  if (args.pull) {
    notes = await pullNotesFromAnki(args.deck, afterBig, args.count);
  } else {
    notes = loadNotesFromJson(args.input, afterBig, args.count);
  }

  if (!notes.length) {
    console.log("No notes to import.");
    return;
  }

  const topics = JSON.parse(readFileSync(topicsPath, "utf8"));
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const existingSlugs = new Set(topics.map((t) => t.slug));

  const slugs = assignSlugs(notes, existingSlugs);
  const newTopics = notes.map((note, i) => noteToTopic(note, slugs[i], slugs));

  const incoming = new Set(slugs);
  const mergedTopics = topics.filter((t) => !incoming.has(t.slug)).concat(newTopics);
  const mergedManifestTopics = manifest.topics
    .filter((t) => !incoming.has(t.slug))
    .concat(newTopics.map(manifestEntry));

  if (args.dryRun) {
    console.log(JSON.stringify({ slugs, newTopics }, null, 2));
    return;
  }

  writeFileSync(topicsPath, JSON.stringify(mergedTopics, null, 2) + "\n", "utf8");
  manifest.topics = mergedManifestTopics;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  const lastId = notes[notes.length - 1].noteId ?? notes[notes.length - 1].id;
  console.log(
    `Imported ${newTopics.length} topic(s): ${slugs.join(", ")}\nLast note ID in batch: ${lastId}\nUpdate scripts/ml-wiki/README.md last-processed line to ${lastId}.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
