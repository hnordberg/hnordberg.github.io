#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const topicsPath = join(root, "src", "app", "ml", "wiki", "content", "topics.json");
const outPath = join(root, "scripts", "ml-wiki", "rendered-references-audit.json");
const baseUrl = process.env.ML_WIKI_BASE_URL ?? "http://localhost:3000";

const topics = JSON.parse(readFileSync(topicsPath, "utf8"));
const slugs = topics.map((t) => t.slug).filter(Boolean);
const issues = [];

function normalize(s) {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

function makeIssue(slug, type, details) {
  return { slug, type, ...details };
}

function parseValidationIssues(stderrText) {
  const out = [];
  const lines = String(stderrText ?? "").split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*-\s+Topic\s+([^:]+):\s*(.+)$/);
    if (!m) continue;
    out.push({
      slug: m[1].trim(),
      type: "validator-issue",
      message: m[2].trim(),
    });
  }
  return out;
}

function countYearMarkers(s) {
  return (String(s).match(/\b(?:19|20)\d{2}\b|\(\d{4}\)/g) || []).length;
}

function isBundledCitationLikely(citation) {
  const text = normalize(citation);
  const semicolonParts = text
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean).length;
  if (semicolonParts >= 2 && countYearMarkers(text) >= 2) return true;
  if (/\bet al\.\s*\(\d{4}[^)]*\)\s+and\s+[^.]*\bet al\.\s*\(\d{4}[^)]*\)/i.test(text)) {
    return true;
  }
  if (/;\s+/.test(text) && /\(\d{4}\)/.test(text)) return true;
  return false;
}

for (const t of topics) {
  const papers = Array.isArray(t.papers) ? t.papers : [];
  for (const p of papers) {
    if (!p || typeof p !== "object" || typeof p.citation !== "string") continue;
    if (isBundledCitationLikely(p.citation)) {
      issues.push(
        makeIssue(t.slug, "data-bundled-citation", {
          reference: p.citation,
          hasLink: Boolean(p.url || p.doi),
        })
      );
    }
  }
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

for (const slug of slugs) {
  const url = `${baseUrl}/ml/wiki/${slug}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(50);
  } catch (err) {
    issues.push(makeIssue(slug, "page-load-failed", { url, error: String(err.message ?? err) }));
    continue;
  }

  const refs = await page.evaluate(() => {
    const list = document.querySelector(".wiki-papers-list");
    if (!list) return [];
    return Array.from(list.querySelectorAll("li")).map((li) => {
      const a = li.querySelector("a");
      const note = li.querySelector(".wiki-papers-note");
      const noteText = note ? note.textContent ?? "" : "";
      const fullText = li.textContent ?? "";
      const textNoNote = note ? fullText.replace(noteText, "") : fullText;
      return {
        text: textNoNote.trim(),
        href: a?.getAttribute("href") ?? "",
        linkText: a?.textContent?.trim() ?? "",
      };
    });
  });

  const seen = new Set();
  for (const r of refs) {
    const key = `${normalize(r.text)}|||${normalize(r.href)}`;
    if (seen.has(key)) {
      issues.push(makeIssue(slug, "duplicate-rendered-reference", { reference: r.text, href: r.href }));
      continue;
    }
    seen.add(key);

    const text = normalize(r.text);
    const linkText = normalize(r.linkText);
    const href = normalize(r.href);
    if (!linkText || !href) continue;

    if (/\b(?:19|20)\d{2}\b/.test(linkText)) {
      issues.push(makeIssue(slug, "year-present-in-link-text", { reference: text, linkText, href }));
    }

    if (/;\s+| and [A-Z][a-z].+\(\d{4}\)/.test(text)) {
      issues.push(makeIssue(slug, "possibly-merged-citation-rendered", { reference: text, href }));
    }

    if (linkText && /^[a-z][a-z-]{2,12}$/.test(linkText) && !/[A-Z]/.test(linkText)) {
      issues.push(makeIssue(slug, "suspicious-lowercase-link-label", { reference: text, linkText, href }));
    }
  }
}

await browser.close();

const validateRun = spawnSync("node", ["scripts/ml-wiki/validate-content.mjs"], {
  cwd: root,
  encoding: "utf8",
});
if (validateRun.status !== 0) {
  issues.push(
    ...parseValidationIssues(validateRun.stderr).map((x) => ({
      ...x,
      source: "ml-wiki:validate",
    }))
  );
}

const report = {
  checkedAt: new Date().toISOString(),
  baseUrl,
  notesChecked: slugs.length,
  issueCount: issues.length,
  issues,
};

writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(`audited ${slugs.length} notes`);
console.log(`found ${issues.length} issue(s)`);
console.log(`report: ${outPath}`);
