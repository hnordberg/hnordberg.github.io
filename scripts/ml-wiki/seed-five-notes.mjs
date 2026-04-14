/**
 * Materializes the five lowest note IDs from the study deck as five wiki topics
 * (one normal article per note — not an Anki-style card UI).
 * Back HTML: scripts/ml-wiki/preview-notes/<noteId>-back.html
 *
 * Run: node scripts/ml-wiki/seed-five-notes.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
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
const previewDir = join(__dirname, "preview-notes");

/** Note IDs sorted ascending (smallest first). */
const NOTES = [
  {
    id: 1771711352285,
    slug: "constitutional-classifiers-plus-plus",
    title: "Constitutional Classifiers++",
    paper: {
      citation:
        "Cunningham et al., Constitutional Classifiers++: Efficient Production-Grade Defenses against Universal Jailbreaks (2026).",
      url: "https://arxiv.org/abs/2601.04603",
    },
  },
  {
    id: 1771711352319,
    slug: "continuous-thought-machines",
    title: "Continuous Thought Machines (CTM)",
    paper: {
      citation: "Darlow et al., Continuous Thought Machines (2025).",
      url: "https://arxiv.org/abs/2505.05522",
    },
  },
  {
    id: 1771711352353,
    slug: "mechanistic-oocr-steering-vectors",
    title: "Mechanistic OOCR Steering Vectors",
    paper: {
      citation:
        "Wang et al., Simple Mechanistic Explanations for Out-Of-Context Reasoning (2025).",
      url: "https://arxiv.org/abs/2507.08218",
    },
  },
  {
    id: 1771711352385,
    slug: "critical-representation-fine-tuning",
    title: "Critical Representation Fine-Tuning (CRFT)",
    paper: {
      citation:
        "Huang et al., Enhancing Chain-of-Thought Reasoning with Critical Representation Fine-tuning (2025).",
      url: "https://arxiv.org/abs/2507.10085",
    },
  },
  {
    id: 1771711352419,
    slug: "chain-of-thought-monitorability",
    title: "Chain-of-Thought Monitorability",
    paper: {
      citation:
        "Emmons et al., When Chain of Thought is Necessary, Language Models Struggle to Evade Monitors (2025).",
      url: "https://arxiv.org/abs/2507.05246",
    },
  },
];

const TAGS_PER = [
  ["advanced", "architecture", "ml", "product", "safety"],
  ["advanced", "architecture", "ml", "theory", "neural-odes"],
  ["advanced", "ml", "theory", "transformer", "interpretability"],
  ["advanced", "implementation", "ml", "transformer", "peft"],
  ["advanced", "ml", "product", "theory", "safety"],
];

const LEGACY_COMBINED_SLUG = "five-lowest-note-ids";
const NOTE_SLUGS = new Set(NOTES.map((n) => n.slug));

function readBackRaw(id) {
  const p = join(previewDir, `${id}-back.html`);
  if (!existsSync(p)) throw new Error(`Missing preview file: ${p}`);
  return readFileSync(p, "utf8").replace(/\r\n/g, "\n").trim();
}

function readBack(id) {
  return prepareBackHtml(readBackRaw(id), id);
}

function relatedForIndex(i) {
  const n = NOTES.length;
  const next = NOTES[(i + 1) % n].slug;
  const prev = NOTES[(i + n - 1) % n].slug;
  return [next, prev];
}

function buildTopic(meta, i) {
  const raw = readBack(meta.id);
  const { sections, footerText, footerUrl } = transformDeckNoteHtml(raw);
  const summary =
    summaryFromSections(sections) || `Note ${meta.id}: ${meta.title}`;

  const rawCitation = footerText.trim() || meta.paper.citation;
  const citation = normalizeCitationText(rawCitation) || meta.paper.citation;
  const url = footerUrl || meta.paper.url;
  const papers = [
    {
      citation,
      ...(url ? { url } : {}),
      ...(meta.paper.doi ? { doi: meta.paper.doi } : {}),
    },
  ];

  return {
    slug: meta.slug,
    title: meta.title,
    summary,
    domain: "llm",
    level: "advanced",
    type: "mixed",
    tags: [...new Set([...TAGS_PER[i], "wiki-import"])].sort(),
    prerequisites: [],
    related: relatedForIndex(i),
    updatedAt: new Date().toISOString().slice(0, 10),
    sourceDeck: "Machine Learning by Henrik Nordberg",
    papers,
    sections,
    cards: [],
  };
}

const newTopics = NOTES.map((meta, i) => buildTopic(meta, i));

const topics = JSON.parse(readFileSync(topicsPath, "utf8"));
const filtered = topics.filter(
  (t) => t.slug !== LEGACY_COMBINED_SLUG && !NOTE_SLUGS.has(t.slug)
);
filtered.push(...newTopics);
writeFileSync(topicsPath, JSON.stringify(filtered, null, 2) + "\n", "utf8");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const mFiltered = manifest.topics.filter(
  (t) => t.slug !== LEGACY_COMBINED_SLUG && !NOTE_SLUGS.has(t.slug)
);
for (const t of newTopics) {
  mFiltered.push({
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
  });
}
manifest.topics = mFiltered;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(
  `Added ${newTopics.length} wiki topics (one per note): ${NOTES.map((n) => n.slug).join(", ")}`
);
