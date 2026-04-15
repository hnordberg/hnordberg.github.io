/**
 * Validates ML wiki JSON content (mirrors src/app/ml/wiki/lib/validate.ts rules).
 * Also auto-fixes known deck-import section-split issues before validation.
 * Run from repo root: npm run ml-wiki:validate
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
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
const LEVELS = new Set(["basic", "intro", "intermediate", "advanced"]);
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
const RAW_LT_SUBSCRIPT_RE = /_\{<[^}]*\}/;
const PRE_STYLE_RE = /<pre\s+[^>]*style="([^"]*)"[^>]*>/gi;
const LIGHT_BG_RE =
  /(?:background(?:-color)?\s*:\s*(?:#f5f5f5|#fff|#ffffff|rgb\(\s*245\s*,\s*245\s*,\s*245\s*\)|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|white))/i;
const COLOR_DECL_RE = /(?:^|;)\s*color\s*:/i;
const BROKEN_DISPLAY_MATH_RE = /(?<!\\)\[\s*mathcal\{[^<]*\]/i;
const PACKED_MULTI_CITATION_RE =
  /(see also|scaled to|original .*?·|et al\.\s*\(\d{4}\).*(et al\.\s*\(\d{4}\)|,\s*[A-Z][a-z]+ et al\.\s*\(\d{4}\)))/i;
const YEAR_RE = /\b(?:19|20)\d{2}\b|\(\d{4}\)/;
const INLINE_URL_RE = /https?:\/\/\S+/i;

function appearsBundledMultiWorkCitation(citation) {
  if (PACKED_MULTI_CITATION_RE.test(citation)) return true;
  if (/\bet al\.\s*\(\d{4}[^)]*\)\s+and\s+[^.]*\bet al\.\s*\(\d{4}[^)]*\)/i.test(citation)) {
    return true;
  }

  const yearParenCount = (citation.match(/\(\d{4}\)/g) || []).length;
  const etAlCount = (citation.match(/et al\./gi) || []).length;
  const commaCount = (citation.match(/,/g) || []).length;
  const semicolonParts = citation
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean).length;

  // Common merged formats:
  // - "Author et al. (2019); Author et al. (2020)"
  // - "..., Author et al. (2019), Author et al. (2024)"
  if (semicolonParts >= 2 && (yearParenCount >= 1 || etAlCount >= 2)) return true;
  if (yearParenCount >= 2 && etAlCount >= 2) return true;
  // Covers citation lists that may omit repeated "et al." tokens but still
  // include multiple parenthesized years/work markers in one paper entry.
  if (yearParenCount >= 2 && (semicolonParts >= 2 || commaCount >= 2)) return true;

  return false;
}

function hasDuplicatedTrailingTitle(citation) {
  const parts = citation
    .split("·")
    .map((x) => x.trim())
    .filter(Boolean);
  if (parts.length < 2) return false;
  const last = parts[parts.length - 1].toLowerCase();
  const prev = parts[parts.length - 2].toLowerCase();
  return last === prev;
}

function isLikelyTitleOnlyCitation(citation) {
  const parts = citation
    .split("·")
    .map((x) => x.trim())
    .filter(Boolean);
  const hasYear = YEAR_RE.test(citation);
  const hasAuthorCue = /\bet al\.\b|\b[A-Z][a-zA-Z'`-]+\s*\(\d{4}\)/.test(citation);
  return parts.length <= 1 && !hasYear && !hasAuthorCue;
}

function isLikelyUnnormalizedAuthorYearCitation(citation) {
  const parts = citation
    .split("·")
    .map((x) => x.trim())
    .filter(Boolean);
  // Canonical expected shape for linked citations is "year · authors · title".
  // A common import artifact is "Author et al. (YYYY) · Title", which makes
  // the whole string become link text in the UI.
  return (
    parts.length === 2 &&
    /\bet al\.\s*\(\d{4}\)/i.test(citation) &&
    !/^\d{4}\b/.test(parts[0])
  );
}

function hasAuthorYearButNotCanonicalStart(citation) {
  // Catches forms like:
  // "applied to ... by Ouyang et al. (2022) in ..."
  // where author+year exists but citation does not start with "YYYY ·".
  return /\bet al\.\s*\(\d{4}\)/i.test(citation) && !/^\d{4}\s*·/.test(citation);
}

function readJson(rel) {
  const p = join(contentDir, rel);
  if (!existsSync(p)) throw new Error(`Missing file: ${p}`);
  return JSON.parse(readFileSync(p, "utf8"));
}

const OPEN_DERIV_TAIL =
  /<details\s*>\s*<summary\s*>\s*Derivations\s*<\/summary\s*>\s*$/i;
const ORPHAN_DIV = /^\s*<\/div>\s*$/;
const LEADING_ORPHAN_DIV = /^\s*<\/div>\s*/;

function isOrphanDivSection(sec) {
  if (!sec || sec.kind !== "prose") return false;
  const b = sec.body ?? "";
  return ORPHAN_DIV.test(b);
}

function stripLeadingDivNoise(s) {
  return s.replace(LEADING_ORPHAN_DIV, "").trimStart();
}

function repairDerivationSplitSections(sections) {
  const out = [];
  let i = 0;
  while (i < sections.length) {
    const sec = sections[i];
    const body = sec.body ?? "";
    const m = body.match(OPEN_DERIV_TAIL);
    if (!m) {
      out.push(sec);
      i++;
      continue;
    }

    const prefix = body.slice(0, m.index).trimEnd();
    let j = i + 1;
    while (j < sections.length && isOrphanDivSection(sections[j])) j++;

    let buf = "";
    let last = j - 1;
    const maxSpan = 8;
    for (let k = 0; k < maxSpan && j < sections.length; k++, j++) {
      buf += sections[j].body ?? "";
      last = j;
      if (buf.includes("</details>")) break;
    }

    buf = stripLeadingDivNoise(buf);
    if (!buf.includes("</details>")) {
      out.push(sec);
      i++;
      continue;
    }

    const closeIdx = buf.indexOf("</details>");
    const derivInner = buf.slice(0, closeIdx).trim();
    let tail = buf.slice(closeIdx + "</details>".length).trim();

    out.push({
      ...sec,
      body: prefix,
    });
    out.push({
      kind: "prose",
      title: "Derivations",
      body: `<details>\n    <summary>Derivations</summary>\n    ${derivInner}\n  </details>`,
    });

    tail = stripLeadingDivNoise(tail);
    if (tail) out.push({ kind: "prose", body: tail });
    i = last + 1;
  }
  return out;
}

function autoFixImportedSectionSplits(topics) {
  let changed = 0;
  for (const t of topics) {
    const before = JSON.stringify(t.sections ?? []);
    const repaired = repairDerivationSplitSections(t.sections ?? []);
    if (JSON.stringify(repaired) !== before) {
      t.sections = repaired;
      changed++;
    }
  }
  return changed;
}

function collectSectionHtmlStrings(topic) {
  const out = [];
  if (typeof topic.historyHtml === "string") out.push(topic.historyHtml);
  if (typeof topic.referencesHtml === "string") out.push(topic.referencesHtml);
  if (Array.isArray(topic.sections)) {
    for (const s of topic.sections) {
      if (s && typeof s.body === "string") out.push(s.body);
    }
  }
  return out;
}

function hasLowContrastInlinePre(html) {
  PRE_STYLE_RE.lastIndex = 0;
  let m;
  while ((m = PRE_STYLE_RE.exec(html)) !== null) {
    const style = m[1] ?? "";
    if (LIGHT_BG_RE.test(style) && !COLOR_DECL_RE.test(style)) {
      return true;
    }
  }
  return false;
}

function hasBrokenDisplayMathFormatting(html) {
  return BROKEN_DISPLAY_MATH_RE.test(html);
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

  // Auto-fix known importer split issue before validation.
  const fixed = autoFixImportedSectionSplits(topics);
  if (fixed > 0) {
    const topicsPath = join(contentDir, "topics.json");
    writeFileSync(topicsPath, JSON.stringify(topics, null, 2) + "\n", "utf8");
    console.log(`Auto-fixed derivation split sections in ${fixed} topic(s).`);
  }

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
          if (INLINE_URL_RE.test(p.citation)) {
            out.push(
              `Topic ${t.slug}: paper citation should not include inline URL text; use paper.url field`
            );
          }
          if (hasDuplicatedTrailingTitle(p.citation)) {
            out.push(
              `Topic ${t.slug}: papers citation appears to repeat the title (remove duplicate segment)`
            );
          }
          // For arXiv-linked entries, guard against title-only citations.
          if (typeof p.url === "string" && p.url.includes("arxiv.org")) {
            if (isLikelyTitleOnlyCitation(p.citation)) {
              out.push(
                `Topic ${t.slug}: arXiv-linked paper citation looks title-only; include author and year`
              );
            }
            if (isLikelyUnnormalizedAuthorYearCitation(p.citation)) {
              out.push(
                `Topic ${t.slug}: arXiv-linked paper citation should use canonical format "year · authors · title"`
              );
            }
            if (hasAuthorYearButNotCanonicalStart(p.citation)) {
              out.push(
                `Topic ${t.slug}: arXiv-linked paper citation has author/year but is not in canonical "year · authors · title" order`
              );
            }
          }
          if (appearsBundledMultiWorkCitation(p.citation)) {
            if (p.url === undefined) {
              out.push(
                `Topic ${t.slug}: papers entry appears to bundle multiple works without URL(s); split into separate paper objects`
              );
            } else {
              out.push(
                `Topic ${t.slug}: papers entry appears to bundle multiple works under one URL; split into separate paper objects with per-paper URLs`
              );
            }
          }
        }
      }
    }

    // Raw "<" inside TeX subscripts (e.g. w_{<t}) is parsed as HTML and can
    // break rendering; require escaped form (&lt;) or alternative notation.
    for (const html of collectSectionHtmlStrings(t)) {
      if (RAW_LT_SUBSCRIPT_RE.test(html)) {
        out.push(
          `Topic ${t.slug}: raw "<" in TeX subscript (use &lt; or 1:t-1 notation)`
        );
        break;
      }
    }

    // Inline <pre style="..."> with a light background and no explicit text color
    // can render as low contrast in some themes.
    for (const html of collectSectionHtmlStrings(t)) {
      if (hasLowContrastInlinePre(html)) {
        out.push(
          `Topic ${t.slug}: inline <pre> has light background without explicit text color`
        );
        break;
      }
    }

    // Guard against malformed display math imported as plain "[ mathcal{...}]"
    // (missing MathJax delimiters/escaping, often from corrupted deck HTML).
    for (const html of collectSectionHtmlStrings(t)) {
      if (hasBrokenDisplayMathFormatting(html)) {
        out.push(
          `Topic ${t.slug}: malformed display math block (expected MathJax delimiters like \\[ ... \\])`
        );
        break;
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
