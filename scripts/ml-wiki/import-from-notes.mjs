/**
 * Build topics.json from a flat Anki-style JSON export.
 *
 * Usage: node scripts/ml-wiki/import-from-notes.mjs <notes.json>
 *
 * Each input note:
 *   { noteId, tags: string[], fields: { Front?: string, Back?: string, ... } }
 *
 * Notes must include a tag `ml-wiki:<kebab-slug>` to assign to a topic bucket.
 * Optional: `ml-domain:supervised`, `ml-level:intro`, `ml-type:mixed` style tags
 * (see WIKI_* sets in validate-content.mjs) — otherwise defaults apply.
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const outPath = join(root, "src", "app", "ml", "wiki", "content", "topics.json");

const WIKI_TAG = /^ml-wiki:([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const DOMAIN_TAG = /^ml-domain:(.+)$/;
const LEVEL_TAG = /^ml-level:(.+)$/;
const TYPE_TAG = /^ml-type:(.+)$/;

const DEFAULT_DOMAIN = "other";
const DEFAULT_LEVEL = "intermediate";
const DEFAULT_TYPE = "mixed";
const SOURCE_DECK = "Machine Learning by Henrik Nordberg";

function pickWikiSlug(tags) {
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

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node import-from-notes.mjs <notes.json>");
    process.exit(2);
  }
  const raw = JSON.parse(readFileSync(inputPath, "utf8"));
  const notes = Array.isArray(raw.notes) ? raw.notes : raw;
  if (!Array.isArray(notes)) {
    console.error("Input must be { notes: [...] } or a top-level array.");
    process.exit(2);
  }

  const buckets = new Map();

  for (const note of notes) {
    const tags = Array.isArray(note.tags) ? note.tags : [];
    const slug = pickWikiSlug(tags);
    if (!slug) {
      console.warn(`Skip note ${note.noteId ?? "?"}: no ml-wiki:<slug> tag`);
      continue;
    }
    const fields = note.fields && typeof note.fields === "object" ? note.fields : {};
    const front = fields.Front ?? fields.front ?? "";
    const back = fields.Back ?? fields.back ?? "";
    if (!buckets.has(slug)) buckets.set(slug, []);
    buckets.get(slug).push({
      noteId: String(note.noteId ?? note.id ?? cryptoRandomId()),
      front,
      back,
      tags: tags.filter((t) => !WIKI_TAG.test(t)),
    });
  }

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
  const LEVELS = new Set(["basic", "intro", "intermediate", "advanced"]);
  const TYPES = new Set([
    "definition",
    "intuition",
    "proof",
    "example",
    "pitfall",
    "mixed",
  ]);

  const topics = [];
  const now = new Date().toISOString().slice(0, 10);

  for (const [slug, cards] of buckets) {
    const sampleTags = cards[0].tags;
    const domain = pickEnumTag(sampleTags, DOMAIN_TAG, DOMAINS, DEFAULT_DOMAIN);
    const level = pickEnumTag(sampleTags, LEVEL_TAG, LEVELS, DEFAULT_LEVEL);
    const type = pickEnumTag(sampleTags, TYPE_TAG, TYPES, DEFAULT_TYPE);
    const allTags = new Set();
    for (const c of cards) {
      for (const t of c.tags) {
        if (!DOMAIN_TAG.test(t) && !LEVEL_TAG.test(t) && !TYPE_TAG.test(t)) {
          allTags.add(t);
        }
      }
    }

    const title = humanTitle(slug);
    const sections = [];
    const wikiCards = [];

    for (const c of cards) {
      sections.push({
        kind: "prose",
        title: `Card ${wikiCards.length + 1}`,
        body: `<p><strong>Front</strong></p>${c.front}<p><strong>Back</strong></p>${c.back}`,
      });
      wikiCards.push({
        noteId: c.noteId,
        prompt: stripHtml(c.front).slice(0, 500) || "(empty front)",
        answer: c.back,
        tags: c.tags,
      });
    }

    topics.push({
      slug,
      title,
      summary: `Imported ${cards.length} note(s) tagged ml-wiki:${slug}.`,
      domain,
      level,
      type,
      tags: [...allTags].sort(),
      prerequisites: [],
      related: [],
      updatedAt: now,
      sourceDeck: SOURCE_DECK,
      sections,
      cards: wikiCards,
    });
  }

  topics.sort((a, b) => a.slug.localeCompare(b.slug));
  writeFileSync(outPath, JSON.stringify(topics, null, 2) + "\n", "utf8");
  console.log(`Wrote ${topics.length} topic(s) to ${outPath}`);
  console.log("Update manifest.json topic list to match these slugs, then run npm run ml-wiki:validate");
}

function humanTitle(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function cryptoRandomId() {
  return `gen-${Math.random().toString(36).slice(2, 12)}`;
}

main();
