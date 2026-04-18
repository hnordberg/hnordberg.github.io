import {
  SECTION_KINDS,
  WIKI_DOMAINS,
  WIKI_LEVELS,
  WIKI_TYPES,
  type WikiCard,
  type WikiDomain,
  type WikiFigure,
  type WikiLearningPath,
  type WikiLevel,
  type WikiManifest,
  type WikiPaperRef,
  type WikiPathsFile,
  type WikiSection,
  type WikiSectionKind,
  type WikiTopic,
  type WikiContentType,
} from "../types";

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isString);
}

function isIn<T extends string>(v: unknown, allowed: readonly T[]): v is T {
  return typeof v === "string" && (allowed as readonly string[]).includes(v);
}

export function isWikiDomain(v: unknown): v is WikiDomain {
  return isIn(v, WIKI_DOMAINS);
}

export function isWikiLevel(v: unknown): v is WikiLevel {
  return isIn(v, WIKI_LEVELS);
}

export function isWikiContentType(v: unknown): v is WikiContentType {
  return isIn(v, WIKI_TYPES);
}

export function isWikiSectionKind(v: unknown): v is WikiSectionKind {
  return isIn(v, SECTION_KINDS);
}

function isWikiFigure(v: unknown): v is WikiFigure {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return isString(o.src) && isString(o.alt);
}

export function isWikiSection(v: unknown): v is WikiSection {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (!isWikiSectionKind(o.kind)) return false;
  if (o.title !== undefined && !isString(o.title)) return false;
  if (o.body !== undefined && !isString(o.body)) return false;
  if (o.equation !== undefined && !isString(o.equation)) return false;
  if (o.figure !== undefined && !isWikiFigure(o.figure)) return false;
  if (o.sourceCardIds !== undefined && !isStringArray(o.sourceCardIds))
    return false;
  return true;
}

export function isWikiCard(v: unknown): v is WikiCard {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (!isString(o.noteId) || !isString(o.prompt) || !isString(o.answer))
    return false;
  if (!isStringArray(o.tags)) return false;
  if (o.mediaRefs !== undefined && !isStringArray(o.mediaRefs)) return false;
  return true;
}

function isWikiPaperRef(v: unknown): v is WikiPaperRef {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (!isString(o.citation)) return false;
  if (o.url !== undefined && !isString(o.url)) return false;
  if (o.doi !== undefined && !isString(o.doi)) return false;
  if (o.note !== undefined && !isString(o.note)) return false;
  return true;
}

/** Short description for invalid-field diagnostics */
function typeDesc(x: unknown): string {
  if (x === undefined) return "undefined";
  if (x === null) return "null";
  const t = typeof x;
  if (t === "object") return Array.isArray(x) ? "array" : "object";
  const s = String(x);
  return s.length > 120 ? `${t} (${s.slice(0, 117)}…)` : `${t} (${s})`;
}

function wikiTopicInvalidReason(v: unknown): string | null {
  if (!v || typeof v !== "object")
    return v == null ? `expected object, got ${typeDesc(v)}` : `expected object, got ${typeof v}`;
  const o = v as Record<string, unknown>;

  if (!isString(o.slug)) return `slug must be string; got ${typeDesc(o.slug)}`;
  if (!isString(o.title)) return `title must be string; got ${typeDesc(o.title)}`;
  if (!isString(o.summary)) return `summary must be string; got ${typeDesc(o.summary)}`;
  if (!isWikiDomain(o.domain))
    return `domain must be one of ${WIKI_DOMAINS.join(", ")}; got ${typeDesc(o.domain)}`;
  if (!isWikiLevel(o.level))
    return `level must be one of ${WIKI_LEVELS.join(", ")}; got ${typeDesc(o.level)}`;
  if (!isWikiContentType(o.type))
    return `type must be one of ${WIKI_TYPES.join(", ")}; got ${typeDesc(o.type)}`;
  if (!isStringArray(o.tags)) return `tags must be string[]; got ${typeDesc(o.tags)}`;
  if (!isStringArray(o.prerequisites))
    return `prerequisites must be string[]; got ${typeDesc(o.prerequisites)}`;
  if (!isStringArray(o.related)) return `related must be string[]; got ${typeDesc(o.related)}`;
  if (!isString(o.updatedAt))
    return `updatedAt must be string; got ${typeDesc(o.updatedAt)}`;
  if (!isString(o.sourceDeck))
    return `sourceDeck must be string; got ${typeDesc(o.sourceDeck)}`;

  if (!Array.isArray(o.sections))
    return `sections must be array; got ${typeDesc(o.sections)}`;
  for (let i = 0; i < o.sections.length; i++) {
    if (!isWikiSection(o.sections[i]))
      return `sections[${i}] is not a valid WikiSection`;
  }

  if (!Array.isArray(o.cards)) return `cards must be array; got ${typeDesc(o.cards)}`;
  for (let i = 0; i < o.cards.length; i++) {
    if (!isWikiCard(o.cards[i])) return `cards[${i}] is not a valid WikiCard`;
  }

  if (o.historyHtml !== undefined && !isString(o.historyHtml))
    return `historyHtml must be string when present; got ${typeDesc(o.historyHtml)}`;
  if (o.referencesHtml !== undefined && !isString(o.referencesHtml))
    return `referencesHtml must be string when present; got ${typeDesc(o.referencesHtml)}`;

  if (o.papers !== undefined) {
    if (!Array.isArray(o.papers))
      return `papers must be array when present; got ${typeDesc(o.papers)}`;
    for (let i = 0; i < o.papers.length; i++) {
      if (!isWikiPaperRef(o.papers[i]))
        return `papers[${i}] is not a valid WikiPaperRef`;
    }
  }

  return null;
}

export function isWikiTopic(v: unknown): v is WikiTopic {
  const reason = wikiTopicInvalidReason(v);
  if (reason !== null) {
    const slug =
      v && typeof v === "object" && isString((v as Record<string, unknown>).slug)
        ? (v as Record<string, unknown>).slug
        : undefined;
    console.warn(
      `[isWikiTopic] invalid${slug != null ? ` (slug: ${slug})` : ""}: ${reason}`
    );
    console.warn("[isWikiTopic] value:", v);
    return false;
  }
  return true;
}

export function isWikiManifest(v: unknown): v is WikiManifest {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (o.version !== 1) return false;
  if (!isString(o.updatedAt) || !isString(o.sourceDeck)) return false;
  if (!Array.isArray(o.topics)) return false;
  for (const t of o.topics) {
    if (!t || typeof t !== "object") return false;
    const e = t as Record<string, unknown>;
    if (!isString(e.slug) || !isString(e.title) || !isString(e.summary))
      return false;
    if (!isWikiDomain(e.domain)) return false;
    if (!isWikiLevel(e.level)) return false;
    if (!isWikiContentType(e.type)) return false;
    if (!isStringArray(e.tags)) return false;
    if (!isStringArray(e.prerequisites)) return false;
    if (!isStringArray(e.related)) return false;
    if (!isString(e.updatedAt) || !isString(e.sourceDeck)) return false;
  }
  return true;
}

export function isWikiLearningPath(v: unknown): v is WikiLearningPath {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (!isString(o.slug) || !isString(o.title) || !isString(o.description))
    return false;
  if (!o.criteria || typeof o.criteria !== "object") return false;
  const c = o.criteria as Record<string, unknown>;
  if (c.includeTags !== undefined && !isStringArray(c.includeTags)) return false;
  if (c.excludeTags !== undefined && !isStringArray(c.excludeTags)) return false;
  if (o.estimatedMinutes !== undefined && typeof o.estimatedMinutes !== "number")
    return false;
  return true;
}

export function isWikiPathsFile(v: unknown): v is WikiPathsFile {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (o.version !== 1) return false;
  if (!Array.isArray(o.paths) || !o.paths.every(isWikiLearningPath))
    return false;
  return true;
}
