/**
 * Auto-fix title-only arXiv citations in ML wiki topics.
 *
 * For paper entries where:
 * - url is https://arxiv.org/abs/<id>
 * - citation looks title-only (no clear author/year metadata)
 *
 * the script fetches metadata from the arXiv API and rewrites citation to:
 *   "YYYY · <Author> et al. · <Title>"
 *
 * Usage:
 *   node scripts/ml-wiki/fix-title-only-arxiv-citations.mjs
 *   node scripts/ml-wiki/fix-title-only-arxiv-citations.mjs --dry-run
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const topicsPath = join(root, "src", "app", "ml", "wiki", "content", "topics.json");
const DRY_RUN = process.argv.includes("--dry-run");

function decodeHtml(s) {
  return s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function extractArxivId(url) {
  const m = String(url).match(/arxiv\.org\/abs\/([A-Za-z0-9.\-_/]+)/i);
  return m ? m[1] : null;
}

function looksTitleOnly(citation) {
  const c = String(citation ?? "").trim();
  if (!c) return true;
  const hasYear = /\b(?:19|20)\d{2}\b|\(\d{4}\)/.test(c);
  const hasAuthorCue =
    /\bet al\.\b|\b[A-Z][a-zA-Z'`-]+\s*\(\d{4}\)|\b[A-Z][a-zA-Z'`-]+\s+(?:and|&)\s+[A-Z][a-zA-Z'`-]+/.test(
      c
    );
  const parts = c
    .split("·")
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.length <= 1 && !hasYear && !hasAuthorCue;
}

function normalizeWhitespace(s) {
  return String(s).replace(/\s+/g, " ").trim();
}

async function fetchArxivMeta(id) {
  const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`arXiv API ${res.status} for id ${id}`);
  }
  const xml = await res.text();

  const titleM = xml.match(/<title>([\s\S]*?)<\/title>/i);
  // First <title> in feed is "ArXiv Query Results"; use second if present.
  const allTitles = [...xml.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((m) =>
    normalizeWhitespace(decodeHtml(m[1]))
  );
  const title = allTitles.length >= 2 ? allTitles[1] : titleM ? normalizeWhitespace(decodeHtml(titleM[1])) : "";

  const publishedM = xml.match(/<published>(\d{4})-\d{2}-\d{2}T/i);
  const year = publishedM ? publishedM[1] : "";

  const authors = [...xml.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/gi)].map((m) =>
    normalizeWhitespace(decodeHtml(m[1]))
  );

  if (!title || !year || authors.length === 0) {
    throw new Error(`Missing arXiv metadata fields for id ${id}`);
  }

  return { title, year, authors };
}

function formatCitation({ title, year, authors }) {
  const first = authors[0];
  const authorLabel = authors.length > 1 ? `${first} et al.` : first;
  return `${year} · ${authorLabel} · ${title}`;
}

async function main() {
  const topics = JSON.parse(readFileSync(topicsPath, "utf8"));
  const cache = new Map();
  const changes = [];

  for (const topic of topics) {
    if (!Array.isArray(topic.papers)) continue;

    for (const paper of topic.papers) {
      if (!paper || typeof paper !== "object") continue;
      if (typeof paper.url !== "string") continue;
      if (!paper.url.includes("arxiv.org/abs/")) continue;
      if (!looksTitleOnly(paper.citation)) continue;

      const id = extractArxivId(paper.url);
      if (!id) continue;

      let meta = cache.get(id);
      if (!meta) {
        try {
          meta = await fetchArxivMeta(id);
          cache.set(id, meta);
        } catch (err) {
          console.warn(`skip ${topic.slug}: failed to fetch ${id}: ${err.message}`);
          continue;
        }
      }

      const nextCitation = formatCitation(meta);
      if (paper.citation !== nextCitation) {
        changes.push({
          slug: topic.slug,
          from: paper.citation,
          to: nextCitation,
          url: paper.url,
        });
        paper.citation = nextCitation;
      }
    }
  }

  if (!DRY_RUN && changes.length > 0) {
    writeFileSync(topicsPath, JSON.stringify(topics, null, 2) + "\n", "utf8");
  }

  console.log(`${DRY_RUN ? "dry-run" : "updated"}: ${changes.length} citation(s)`);
  for (const c of changes) {
    console.log(` - ${c.slug}: "${c.from}" -> "${c.to}"`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

