import type { WikiManifest, WikiTopicIndexEntry, WikiLearningPath } from "../types";

const LEVEL_WEIGHTS: Record<string, number> = {
  intro: 1,
  basic: 2,
  intermediate: 3,
  advanced: 4,
};

export function sortTopics(topics: WikiTopicIndexEntry[]): WikiTopicIndexEntry[] {
  return [...topics].sort((a, b) => {
    const wa = LEVEL_WEIGHTS[a.level] || 99;
    const wb = LEVEL_WEIGHTS[b.level] || 99;
    if (wa !== wb) {
      return wa - wb;
    }
    return a.title.localeCompare(b.title);
  });
}

/**
 * Filter and sort manifest topics based on a Path's criteria.
 */
export function resolvePathTopics(
  manifest: WikiManifest,
  pathDef: WikiLearningPath
): WikiTopicIndexEntry[] {
  const { includeTags = [], excludeTags = [], levels = [] } = pathDef.criteria;

  // 1. Filter
  const matched = manifest.topics.filter((topic) => {
    // Optimization: skip if levels are specified and topic level doesn't match
    if (levels.length > 0 && !levels.includes(topic.level)) {
      return false;
    }

    // Exclude condition
    if (excludeTags.length > 0) {
      const hasExcluded = topic.tags.some((tag) => excludeTags.includes(tag));
      if (hasExcluded) return false;
    }

    // Include condition (OR logic as requested by user)
    if (includeTags.length > 0) {
      const hasIncluded = topic.tags.some((tag) => includeTags.includes(tag));
      if (!hasIncluded) return false;
    }

    return true;
  });

  // 2. Sort naturally by Level
  return sortTopics(matched);
}
