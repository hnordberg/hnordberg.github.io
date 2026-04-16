/**
 * Shared transforms: Anki deck-style HTML backs → wiki sections + footer metadata.
 */

export const DECK_WRAPPER_OPEN =
  '<div style="max-width:680px; font-family:sans-serif; line-height:1.6; padding:8px;">';

export function scopeSvgIds(html, id) {
  const suf = `_${id}`;
  const ids = new Set();
  const reId = /id="([^"]+)"/g;
  let m;
  while ((m = reId.exec(html)) !== null) {
    ids.add(m[1]);
  }
  let out = html;
  for (const oldId of ids) {
    const newId = oldId + suf;
    out = out.split(`id="${oldId}"`).join(`id="${newId}"`);
    out = out.split(`url(#${oldId})`).join(`url(#${newId})`);
  }
  return out;
}

/** Pull footer citation(s) out of the body so they appear only in `papers`. */
export function extractSmall(html) {
  const footers = [];
  const out = html.replace(/<small>[\s\S]*?<\/small>/gi, (block) => {
    footers.push(block);
    return "";
  });
  return { html: out, footerBlocks: footers };
}

export function stripHr(html) {
  return html.replace(/\s*<hr\s*\/?>\s*/gi, "");
}

export function unwrapDeckWrapper(html) {
  let h = html.trim();
  if (h.startsWith(DECK_WRAPPER_OPEN) && h.endsWith("</div>")) {
    h = h.slice(DECK_WRAPPER_OPEN.length);
    h = h.slice(0, -"</div>".length).trim();
  }
  return h;
}

/** First https?:// URL inside footer blocks, if any. */
export function firstUrlFromFooterBlocks(footerBlocks) {
  const joined = footerBlocks.join("\n");
  const m = joined.match(/href="(https?:\/\/[^"]+)"/i);
  return m ? m[1] : null;
}

/** Plain citation line from footer HTML. */
export function footerPlainText(footerBlocks) {
  return footerBlocks
    .map((block) =>
      block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    )
    .filter(Boolean)
    .join(" · ");
}

/** Split deck HTML into wiki `sections` (prose blocks); centered SVG blocks become their own section. */
export function splitIntoWikiSections(inner) {
  const sections = [];
  let work = inner.trim();

  const figRe = /<div style="text-align:center[^>]*>[\s\S]*?<\/div>/i;
  const figM = work.match(figRe);
  if (figM) {
    const before = work.slice(0, figM.index).trim();
    const fig = figM[0].trim();
    work = work.slice(figM.index + figM[0].length).trim();
    if (before) {
      sections.push({ kind: "prose", body: before });
    }
    sections.push({
      kind: "prose",
      title: "Illustration",
      body: `<div class="wiki-deck-figure-wrap">${fig}</div>`,
    });
  }

  const parts = work
    .split(/(?=<p><b>)/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const part of parts) {
    const hm = part.match(/^<p><b>([^<]+)<\/b><\/p>/i);
    if (hm) {
      // Section titles are rendered as plain text in the UI, so decode any
      // HTML entities (e.g. `&amp;` -> `&`) that the deck exporter leaves in.
      const title = normalizeCitationText(hm[1].replace(/:\s*$/, ""));
      const body = part.slice(hm[0].length).trim();
      if (body) {
        sections.push({ kind: "prose", title, body });
      }
    } else if (part) {
      sections.push({ kind: "prose", body: part });
    }
  }

  return sections;
}

export function transformDeckNoteHtml(rawHtml) {
  const { html: withoutSmall, footerBlocks } = extractSmall(rawHtml);
  let html = stripHr(withoutSmall);
  html = unwrapDeckWrapper(html);
  const sections = splitIntoWikiSections(html);
  const footerText = footerPlainText(footerBlocks);
  const footerUrl = firstUrlFromFooterBlocks(footerBlocks);
  return { sections, footerText, footerUrl, footerBlocks };
}

export function firstParagraphPlainFromBody(body) {
  const m = body.match(/<p>([\s\S]*?)<\/p>/i);
  if (!m) return "";
  // Strip tags then decode entities so the resulting plain-text summary
  // (rendered directly in React) doesn't contain literal `&amp;`, `&mdash;`, etc.
  return normalizeCitationText(m[1].replace(/<[^>]+>/g, " "));
}

export function summaryFromSections(sections) {
  for (const s of sections) {
    if (!s.body) continue;
    const plain = firstParagraphPlainFromBody(s.body);
    if (plain) {
      if (plain.length <= 240) return plain;
      return plain.slice(0, 237).trimEnd() + "…";
    }
  }
  return "";
}

/** Strip leftover HTML entities from deck footers so citations render as plain text. */
export function normalizeCitationText(s) {
  return s
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&#x0*a0;/gi, " ")
    .replace(/&middot;|&#183;/gi, "·")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function prepareBackHtml(raw, noteId) {
  let html = raw.replace(/\r\n/g, "\n").trim();
  if (html.includes("<svg")) html = scopeSvgIds(html, noteId);
  return html;
}
