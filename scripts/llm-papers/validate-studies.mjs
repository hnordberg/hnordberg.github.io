/**
 * Validates LLM paper study JSON files against PAPER_STUDY_SPEC.md §14.
 * Run from repo root: npm run llm-studies:validate
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const studiesDir = join(root, "src", "app", "ml", "llm", "content", "studies");
const wikiTopicsPath = join(
  root,
  "src",
  "app",
  "ml",
  "wiki",
  "content",
  "topics.json"
);

const SECTION_KINDS = new Set([
  "prose",
  "equation",
  "pitfall",
  "example",
  "figure",
  "table",
  "result",
  "code",
]);

const FIGURE_SOURCES = /^(hand-svg|paper-ref|scripts\/llm-papers\/figures\/)/;

const BANNED_PHRASES = [
  /\bit's important to note that\b/i,
  /\bin essence\b/i,
  /\bessentially\b/i,
  /\blet's explore\b/i,
  /\blet us consider\b/i,
  /\bsimply put\b/i,
  /\bput simply\b/i,
  /\bgenerally speaking\b/i,
  /\bas we saw above\b/i,
  /\bas mentioned earlier\b/i,
  /\bit can be shown that\b/i,
];

const EM_TAG_RE = /<(em|i)(\s|>)/i;
const INLINE_MATH_OPEN = /\\\(/g;
const INLINE_MATH_CLOSE = /\\\)/g;
const DISPLAY_MATH_OPEN = /\\\[/g;
const DISPLAY_MATH_CLOSE = /\\\]/g;
const DOLLAR_DELIM = /(^|[^\\])\$[^$\n]+\$/;
const MATH_TAG = /<math[\s>]/i;
const WIKI_LINK_RE = /\/ml\/wiki\/topics\/([a-z0-9-]+)/g;

const RESULT_KEYWORDS =
  /\b(BLEU|FID|accuracy|params|FLOPs|perplexity|PPL)\b/i;
const NUMBER_IN_BODY = /\b\d+(\.\d+)?\b/;
const SOURCE_TOKEN = /\b(Table|Fig(?:ure)?|§|Section)\s*\d+/i;

// Extract <svg>...</svg> blocks and flag unescaped ampersands.
// Anything inside an SVG blob must be strict XML: & must be &amp; (or a
// recognized named/numeric entity) to avoid "xmlParseEntityRef: no name".
const SVG_BLOCK_RE = /<svg[\s\S]*?<\/svg>/gi;
const UNESCAPED_AMP_RE =
  /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/;

function loadWikiSlugs() {
  if (!existsSync(wikiTopicsPath)) return null;
  const topics = JSON.parse(readFileSync(wikiTopicsPath, "utf8"));
  return new Set(topics.map((t) => t.slug));
}

function checkMathBalance(text, label) {
  const issues = [];
  const openI = (text.match(INLINE_MATH_OPEN) || []).length;
  const closeI = (text.match(INLINE_MATH_CLOSE) || []).length;
  const openD = (text.match(DISPLAY_MATH_OPEN) || []).length;
  const closeD = (text.match(DISPLAY_MATH_CLOSE) || []).length;
  if (openI !== closeI)
    issues.push(`${label}: unbalanced \\( / \\) (${openI} open, ${closeI} close)`);
  if (openD !== closeD)
    issues.push(`${label}: unbalanced \\[ / \\] (${openD} open, ${closeD} close)`);
  if (DOLLAR_DELIM.test(text))
    issues.push(`${label}: contains $...$ math delimiters (use \\( \\) or \\[ \\])`);
  if (MATH_TAG.test(text))
    issues.push(`${label}: contains <math> tag`);
  return issues;
}

function checkBannedPhrases(text, label) {
  const hits = [];
  for (const re of BANNED_PHRASES) {
    if (re.test(text)) hits.push(`${label}: banned phrase matches ${re}`);
  }
  return hits;
}

function validateStudy(filename, data, wikiSlugs) {
  const issues = [];
  const id = data.id || filename;
  const here = (msg) => `${filename}: ${msg}`;

  // Required top-level fields
  for (const field of ["id", "title", "shortTitle", "pages", "quiz"]) {
    if (!(field in data)) issues.push(here(`missing top-level field "${field}"`));
  }

  if (!data.meta || typeof data.meta !== "object") {
    issues.push(here("missing meta block"));
  } else {
    for (const field of [
      "year",
      "authors",
      "arxivId",
      "prerequisites",
      "related",
    ]) {
      if (!(field in data.meta))
        issues.push(here(`missing meta.${field}`));
    }
    if (wikiSlugs) {
      for (const slug of data.meta.prerequisites || []) {
        if (!wikiSlugs.has(slug))
          issues.push(here(`meta.prerequisites: unknown wiki slug "${slug}"`));
      }
      for (const slug of data.meta.related || []) {
        if (!wikiSlugs.has(slug))
          issues.push(here(`meta.related: unknown wiki slug "${slug}"`));
      }
    }
  }

  if (!Array.isArray(data.pages)) {
    issues.push(here("pages must be an array"));
    return issues;
  }

  if (data.pages.length > 8) {
    issues.push(
      here(`page count ${data.pages.length} exceeds soft cap of 8`)
    );
  }

  // Collect all text across pages for global checks
  const allText = [];

  for (const page of data.pages) {
    const p = `page ${page.pageIndex}`;
    if (!page.pageTitle) issues.push(here(`${p}: missing pageTitle`));
    if (!Array.isArray(page.sections)) {
      issues.push(here(`${p}: sections must be an array`));
      continue;
    }
    for (let i = 0; i < page.sections.length; i++) {
      const s = page.sections[i];
      const sl = `${p} §${i + 1}`;
      if (!s || typeof s !== "object") {
        issues.push(here(`${sl}: section is not an object`));
        continue;
      }
      if (!SECTION_KINDS.has(s.kind)) {
        issues.push(here(`${sl}: invalid kind "${s.kind}"`));
        continue;
      }
      if (s.kind === "equation") {
        if (!s.equation || typeof s.equation !== "string") {
          issues.push(here(`${sl}: equation section missing "equation" field`));
        }
        // equation sections should not have body too (renderer uses equation field only)
      } else {
        if (!s.body || typeof s.body !== "string") {
          issues.push(here(`${sl}: ${s.kind} section missing "body"`));
          continue;
        }
      }

      const text = s.kind === "equation" ? s.equation : s.body;
      allText.push(text);

      // Banned phrases, math balance, em tags, wiki links
      for (const m of checkBannedPhrases(text, here(sl))) issues.push(m);
      for (const m of checkMathBalance(text, here(sl))) issues.push(m);
      if (s.kind !== "equation" && EM_TAG_RE.test(text)) {
        issues.push(here(`${sl}: contains <em>/<i> tag (use <b> or <strong>)`));
      }

      // Wiki link health
      if (wikiSlugs) {
        for (const m of text.matchAll(WIKI_LINK_RE)) {
          if (!wikiSlugs.has(m[1])) {
            issues.push(
              here(`${sl}: wiki link to unknown topic "${m[1]}"`)
            );
          }
        }
      }

      // Kind-specific rules
      if (s.kind === "result" && !s.source) {
        issues.push(here(`${sl}: result section missing "source" field`));
      }
      if (s.kind === "figure") {
        if (!s.source) {
          issues.push(here(`${sl}: figure section missing "source" field`));
        } else if (!FIGURE_SOURCES.test(s.source)) {
          issues.push(
            here(
              `${sl}: figure "source" must be "hand-svg", "paper-ref", or a "scripts/llm-papers/figures/" path (got "${s.source}")`
            )
          );
        }
      }

      // SVG well-formedness: every <svg>...</svg> block must escape & as
      // &amp; (or a recognized entity) — browsers parse SVG as strict XML
      // and "Add & Norm" would fail with "xmlParseEntityRef: no name".
      if (s.kind !== "equation") {
        for (const svgMatch of text.matchAll(SVG_BLOCK_RE)) {
          if (UNESCAPED_AMP_RE.test(svgMatch[0])) {
            const ampIdx = svgMatch[0].search(UNESCAPED_AMP_RE);
            const snippet = svgMatch[0]
              .slice(Math.max(0, ampIdx - 20), ampIdx + 20)
              .replace(/\n/g, " ");
            issues.push(
              here(
                `${sl}: embedded <svg> contains unescaped '&' (use &amp;). Near: "...${snippet}..."`
              )
            );
          }
        }
      }

      // Empirical-number heuristic
      if (
        s.kind !== "equation" &&
        RESULT_KEYWORDS.test(text) &&
        NUMBER_IN_BODY.test(text) &&
        !SOURCE_TOKEN.test(text) &&
        !s.source
      ) {
        issues.push(
          here(
            `${sl}: contains result keyword + number but no Table/Fig/§ citation or "source" field`
          )
        );
      }
    }
  }

  // Quiz checks
  if (!Array.isArray(data.quiz)) {
    issues.push(here("quiz must be an array"));
  } else {
    if (data.quiz.length < 3) {
      issues.push(here(`quiz has ${data.quiz.length} questions; minimum is 3`));
    }
    if (data.quiz.length < data.pages.length) {
      issues.push(
        here(
          `quiz has ${data.quiz.length} questions but study has ${data.pages.length} pages (target: ≥ 1 per page)`
        )
      );
    }
    for (let i = 0; i < data.quiz.length; i++) {
      const q = data.quiz[i];
      const ql = `quiz §${i + 1}`;
      if (!q.prompt || !q.answer) {
        issues.push(here(`${ql}: missing prompt or answer`));
        continue;
      }
      for (const m of checkMathBalance(q.prompt, here(`${ql}.prompt`)))
        issues.push(m);
      for (const m of checkMathBalance(q.answer, here(`${ql}.answer`)))
        issues.push(m);
      for (const m of checkBannedPhrases(q.answer, here(`${ql}.answer`)))
        issues.push(m);
      if (EM_TAG_RE.test(q.answer)) {
        issues.push(here(`${ql}.answer: contains <em>/<i> tag`));
      }
      if (wikiSlugs) {
        for (const m of q.answer.matchAll(WIKI_LINK_RE)) {
          if (!wikiSlugs.has(m[1])) {
            issues.push(
              here(`${ql}.answer: wiki link to unknown topic "${m[1]}"`)
            );
          }
        }
      }
    }
  }

  return issues;
}

function main() {
  if (!existsSync(studiesDir)) {
    console.error(`Studies directory not found: ${studiesDir}`);
    process.exit(1);
  }

  const wikiSlugs = loadWikiSlugs();
  if (!wikiSlugs) {
    console.warn(
      "Warning: could not load wiki topics.json; wiki-link checks will be skipped."
    );
  }

  const files = readdirSync(studiesDir).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.log("No study files to validate.");
    return;
  }

  let totalIssues = 0;
  for (const file of files) {
    const path = join(studiesDir, file);
    let data;
    try {
      data = JSON.parse(readFileSync(path, "utf8"));
    } catch (e) {
      console.error(`${file}: invalid JSON — ${e.message}`);
      totalIssues++;
      continue;
    }
    const issues = validateStudy(file, data, wikiSlugs);
    if (issues.length) {
      console.error(`\n${file}:`);
      for (const msg of issues) console.error(`  - ${msg}`);
      totalIssues += issues.length;
    } else {
      console.log(`${file}: OK (${data.pages.length} pages, ${data.quiz.length} quiz items)`);
    }
  }

  if (totalIssues > 0) {
    console.error(`\nValidation failed: ${totalIssues} issue(s) across ${files.length} file(s).`);
    process.exit(1);
  }
  console.log(`\nAll ${files.length} study file(s) OK.`);
}

main();
