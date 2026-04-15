/**
 * Fix wiki topics where deck import split <details><summary>Derivations</summary>
 * across SectionBlock boundaries (empty collapsible + content in next sections).
 *
 * Rewrites topics.json in place. Run: node scripts/ml-wiki/fix-derivation-details-splits.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const topicsPath = join(root, "src", "app", "ml", "wiki", "content", "topics.json");

const OPEN_DERIV_TAIL =
  /<details\s*>\s*<summary\s*>\s*Derivations\s*<\/summary\s*>\s*$/i;
const ORPHAN_DIV = /^\s*<\/div>\s*$/;
const LEADING_ORPHAN_DIV = /^\s*<\/div>\s*/;

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isOrphanDivSection(sec) {
  if (!sec || sec.kind !== "prose") return false;
  const b = sec.body ?? "";
  return ORPHAN_DIV.test(b);
}

function stripLeadingDivNoise(s) {
  return s.replace(LEADING_ORPHAN_DIV, "").trimStart();
}

/** Extract first <details>...</details> block from html; returns { inner, rest } or null */
function peelDetails(html, summaryLabel) {
  const re = new RegExp(
    `<details\\s*>\\s*<summary\\s*>\\s*${summaryLabel}\\s*<\\/summary\\s*>`,
    "i"
  );
  const m = html.match(re);
  if (!m) return null;
  const start = m.index + m[0].length;
  const closeIdx = html.indexOf("</details>", start);
  if (closeIdx === -1) return null;
  const inner = html.slice(start, closeIdx).trim();
  const rest = html.slice(closeIdx + "</details>".length).trim();
  return { inner, rest };
}

function repairSections(sections) {
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
      body: derivInner,
    });

    tail = stripLeadingDivNoise(tail);
    while (tail) {
      const py = peelDetails(tail, "Python");
      if (py) {
        out.push({ kind: "prose", title: "Python", body: py.inner });
        tail = py.rest.trim();
        continue;
      }
      const gen = tail.match(/^<details\s*>\s*<summary\s*>([^<]+)<\/summary\s*>/i);
      if (gen) {
        const label = gen[1].trim();
        const peeled = peelDetails(tail, escapeRe(label));
        if (peeled) {
          out.push({ kind: "prose", title: label, body: peeled.inner });
          tail = peeled.rest.trim();
          continue;
        }
      }
      if (tail) {
        out.push({ kind: "prose", body: tail });
      }
      break;
    }

    i = last + 1;
  }
  return out;
}

/** Deck import often leaves `</div>` alone after Illustration (closes wiki-deck-figure-wrap). */
function mergeOrphanDivAfterIllustration(sections) {
  const out = [];
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const next = sections[i + 1];
    if (
      s?.title === "Illustration" &&
      next?.kind === "prose" &&
      ORPHAN_DIV.test(next.body ?? "")
    ) {
      out.push({
        ...s,
        body: `${s.body ?? ""}</div>`,
      });
      i++;
      continue;
    }
    out.push(s);
  }
  return out;
}

function main() {
  const topics = JSON.parse(readFileSync(topicsPath, "utf8"));
  let changed = 0;
  for (const t of topics) {
    const before = JSON.stringify(t.sections);
    let secs = t.sections ?? [];
    secs = repairSections(secs);
    secs = mergeOrphanDivAfterIllustration(secs);
    t.sections = secs;
    if (JSON.stringify(t.sections) !== before) {
      changed++;
      console.log("fixed:", t.slug);
    }
  }
  writeFileSync(topicsPath, JSON.stringify(topics, null, 2) + "\n", "utf8");
  console.log("topics updated:", changed);
}

main();
