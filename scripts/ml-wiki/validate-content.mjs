/**
 * Validates ML wiki JSON content (mirrors src/app/ml/wiki/lib/validate.ts rules).
 * Run from repo root: npm run ml-wiki:validate
 */
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const contentDir = join(root, "src", "app", "ml", "wiki", "content");

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
const SECTION_KINDS = new Set([
  "prose",
  "definition",
  "theorem",
  "example",
  "pitfall",
  "equation",
  "figure",
]);

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function readJson(rel) {
  const p = join(contentDir, rel);
  if (!existsSync(p)) throw new Error(`Missing file: ${p}`);
  return JSON.parse(readFileSync(p, "utf8"));
}

function isString(x) {
  return typeof x === "string";
}

function isStringArray(x) {
  return Array.isArray(x) && x.every(isString);
}

function issues() {
  const out = [];
  const topics = readJson("topics.json");
  const manifest = readJson("manifest.json");
  const pathsFile = readJson("paths.json");

  if (!Array.isArray(topics)) {
    out.push("topics.json must be a JSON array");
    return out;
  }

  const topicSlugs = new Set();
  const topicMap = new Map();

  for (const t of topics) {
    if (!t || typeof t !== "object") {
      out.push("Invalid topic entry");
      continue;
    }
    if (!isString(t.slug) || !slugRe.test(t.slug)) {
      out.push(`Invalid slug: ${t.slug}`);
    }
    if (topicSlugs.has(t.slug)) {
      out.push(`Duplicate topic slug: ${t.slug}`);
    }
    topicSlugs.add(t.slug);
    topicMap.set(t.slug, t);

    if (!isString(t.title) || !isString(t.summary)) {
      out.push(`Topic ${t.slug}: missing title or summary`);
    }
    if (!DOMAINS.has(t.domain)) {
      out.push(`Topic ${t.slug}: invalid domain ${t.domain}`);
    }
    if (!LEVELS.has(t.level)) {
      out.push(`Topic ${t.slug}: invalid level ${t.level}`);
    }
    if (!TYPES.has(t.type)) {
      out.push(`Topic ${t.slug}: invalid type ${t.type}`);
    }
    if (!isStringArray(t.tags)) {
      out.push(`Topic ${t.slug}: tags must be string[]`);
    }
    if (!isStringArray(t.prerequisites) || !isStringArray(t.related)) {
      out.push(`Topic ${t.slug}: prerequisites/related must be string[]`);
    }
    if (t.prerequisites.includes(t.slug)) {
      out.push(`Topic ${t.slug}: self prerequisite`);
    }
    if (t.related.includes(t.slug)) {
      out.push(`Topic ${t.slug}: self related`);
    }
    if (!Array.isArray(t.sections)) {
      out.push(`Topic ${t.slug}: sections must be array`);
    } else {
      for (const s of t.sections) {
        if (!s || typeof s !== "object" || !SECTION_KINDS.has(s.kind)) {
          out.push(`Topic ${t.slug}: invalid section`);
          break;
        }
      }
    }
    if (!Array.isArray(t.cards)) {
      out.push(`Topic ${t.slug}: cards must be array`);
    }
    if (t.historyHtml !== undefined && typeof t.historyHtml !== "string") {
      out.push(`Topic ${t.slug}: historyHtml must be string`);
    }
    if (t.referencesHtml !== undefined && typeof t.referencesHtml !== "string") {
      out.push(`Topic ${t.slug}: referencesHtml must be string`);
    }
    if (t.papers !== undefined) {
      if (!Array.isArray(t.papers)) {
        out.push(`Topic ${t.slug}: papers must be array`);
      } else {
        for (const p of t.papers) {
          if (!p || typeof p !== "object" || typeof p.citation !== "string") {
            out.push(`Topic ${t.slug}: invalid paper entry`);
            break;
          }
          if (p.url !== undefined && typeof p.url !== "string") {
            out.push(`Topic ${t.slug}: paper.url must be string`);
          }
          if (p.doi !== undefined && typeof p.doi !== "string") {
            out.push(`Topic ${t.slug}: paper.doi must be string`);
          }
        }
      }
    }
  }

  for (const t of topics) {
    for (const p of t.prerequisites) {
      if (!topicSlugs.has(p)) {
        out.push(`Topic ${t.slug}: unknown prerequisite ${p}`);
      }
    }
    for (const r of t.related) {
      if (!topicSlugs.has(r)) {
        out.push(`Topic ${t.slug}: unknown related ${r}`);
      }
    }
  }

  if (!manifest || manifest.version !== 1) {
    out.push("manifest.json: invalid or missing version");
  } else if (!Array.isArray(manifest.topics)) {
    out.push("manifest.topics must be array");
  } else {
    const mSlugs = new Set(manifest.topics.map((x) => x.slug));
    if (mSlugs.size !== topicSlugs.size) {
      out.push("manifest topic count != topics.json count");
    }
    for (const s of topicSlugs) {
      if (!mSlugs.has(s)) {
        out.push(`manifest missing slug present in topics.json: ${s}`);
      }
    }
    for (const s of mSlugs) {
      if (!topicSlugs.has(s)) {
        out.push(`topics.json missing slug declared in manifest: ${s}`);
      }
    }
  }

  if (!pathsFile || pathsFile.version !== 1 || !Array.isArray(pathsFile.paths)) {
    out.push("paths.json: invalid structure");
  } else {
    const pathSlugs = new Set();
    for (const p of pathsFile.paths) {
      if (!p.slug || pathSlugs.has(p.slug)) {
        out.push(`paths: duplicate or missing path slug`);
      }
      pathSlugs.add(p.slug);
      for (const ts of p.topicSlugs) {
        if (!topicSlugs.has(ts)) {
          out.push(`Path ${p.slug}: unknown topic ${ts}`);
        }
      }
    }
  }

  return out;
}

const found = issues();
if (found.length) {
  console.error("ML Wiki validation failed:\n" + found.map((m) => ` - ${m}`).join("\n"));
  process.exit(1);
}
console.log("ML Wiki content OK.");
