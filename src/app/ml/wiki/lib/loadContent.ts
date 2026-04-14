import type {
  WikiManifest,
  WikiPathsFile,
  WikiTopic,
  WikiTopicIndexEntry,
} from "../types";
import { isWikiPathsFile, isWikiTopic } from "./guards";
import {
  assertNoValidationIssues,
  validateWikiCorpus,
  validateWikiPaths,
} from "./validate";

import manifestJson from "../content/manifest.json";
import pathsJson from "../content/paths.json";
import topicsJson from "../content/topics.json";

function toIndexEntry(t: WikiTopic): WikiTopicIndexEntry {
  return {
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
  };
}

function loadTopicsArray(): WikiTopic[] {
  if (!Array.isArray(topicsJson)) {
    throw new Error("topics.json must be an array");
  }
  const topics: WikiTopic[] = [];
  for (const raw of topicsJson) {
    if (!isWikiTopic(raw)) {
      throw new Error("Invalid entry in topics.json");
    }
    topics.push(raw);
  }
  return topics;
}

function buildManifestFromTopics(topics: WikiTopic[]): WikiManifest {
  const fromFile = manifestJson as unknown;
  if (
    !fromFile ||
    typeof fromFile !== "object" ||
    (fromFile as WikiManifest).version !== 1
  ) {
    throw new Error("Invalid manifest.json");
  }
  const declared = fromFile as WikiManifest;
  const derivedTopics = topics.map(toIndexEntry);
  const declaredSlugs = new Set(declared.topics.map((t) => t.slug));
  const derivedSlugs = new Set(derivedTopics.map((t) => t.slug));
  if (declaredSlugs.size !== derivedSlugs.size) {
    throw new Error("manifest.json topic count does not match topics.json");
  }
  for (const s of derivedSlugs) {
    if (!declaredSlugs.has(s)) {
      throw new Error(
        `manifest.json missing slug present in topics.json: ${s}`
      );
    }
  }
  for (const s of declaredSlugs) {
    if (!derivedSlugs.has(s)) {
      throw new Error(
        `topics.json missing slug declared in manifest.json: ${s}`
      );
    }
  }
  return {
    version: 1,
    updatedAt: declared.updatedAt,
    sourceDeck: declared.sourceDeck,
    topics: derivedTopics,
  };
}

function loadPaths(): WikiPathsFile {
  if (!isWikiPathsFile(pathsJson)) {
    throw new Error("Invalid paths.json");
  }
  return pathsJson;
}

function loadTopicsMap(): Map<string, WikiTopic> {
  const topics = loadTopicsArray();
  const map = new Map<string, WikiTopic>();
  for (const t of topics) {
    if (map.has(t.slug)) {
      throw new Error(`Duplicate slug in topics.json: ${t.slug}`);
    }
    map.set(t.slug, t);
  }
  return map;
}

let cachedManifest: WikiManifest | null = null;
let cachedPaths: WikiPathsFile | null = null;
let cachedTopics: Map<string, WikiTopic> | null = null;

export function getWikiCorpus(): {
  manifest: WikiManifest;
  paths: WikiPathsFile;
  topicsBySlug: Map<string, WikiTopic>;
} {
  if (cachedManifest && cachedPaths && cachedTopics) {
    return {
      manifest: cachedManifest,
      paths: cachedPaths,
      topicsBySlug: cachedTopics,
    };
  }
  const topicsBySlug = loadTopicsMap();
  const topics = [...topicsBySlug.values()];
  const manifest = buildManifestFromTopics(topics);
  const paths = loadPaths();
  const issues = [
    ...validateWikiCorpus(manifest, topicsBySlug),
    ...validateWikiPaths(paths, manifest),
  ];
  assertNoValidationIssues(issues);
  cachedManifest = manifest;
  cachedPaths = paths;
  cachedTopics = topicsBySlug;
  return { manifest, paths, topicsBySlug };
}

export function getAllTopicSlugs(): string[] {
  return getWikiCorpus().manifest.topics.map((t) => t.slug);
}

export function getTopicBySlug(slug: string): WikiTopic | undefined {
  return getWikiCorpus().topicsBySlug.get(slug);
}

export function getManifest(): WikiManifest {
  return getWikiCorpus().manifest;
}

export function getPaths(): WikiPathsFile {
  return getWikiCorpus().paths;
}

export function collectAllTags(): string[] {
  const { manifest } = getWikiCorpus();
  const set = new Set<string>();
  for (const t of manifest.topics) {
    for (const tag of t.tags) {
      set.add(tag);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function getTopicsForTag(tag: string): WikiManifest["topics"] {
  return getWikiCorpus().manifest.topics.filter((t) => t.tags.includes(tag));
}
