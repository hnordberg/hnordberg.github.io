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

export function isWikiTopic(v: unknown): v is WikiTopic {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (!isString(o.slug) || !isString(o.title) || !isString(o.summary))
    return false;
  if (!isWikiDomain(o.domain)) return false;
  if (!isWikiLevel(o.level)) return false;
  if (!isWikiContentType(o.type)) return false;
  if (!isStringArray(o.tags)) return false;
  if (!isStringArray(o.prerequisites)) return false;
  if (!isStringArray(o.related)) return false;
  if (!isString(o.updatedAt) || !isString(o.sourceDeck)) return false;
  if (!Array.isArray(o.sections) || !o.sections.every(isWikiSection))
    return false;
  if (!Array.isArray(o.cards) || !o.cards.every(isWikiCard)) return false;
  if (o.historyHtml !== undefined && !isString(o.historyHtml)) return false;
  if (o.referencesHtml !== undefined && !isString(o.referencesHtml))
    return false;
  if (o.papers !== undefined) {
    if (!Array.isArray(o.papers) || !o.papers.every(isWikiPaperRef))
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
