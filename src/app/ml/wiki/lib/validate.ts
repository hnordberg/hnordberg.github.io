import type { WikiManifest, WikiPathsFile, WikiTopic } from "../types";
import { isWikiManifest, isWikiPathsFile, isWikiTopic } from "./guards";

export type WikiValidationIssue = {
  code: string;
  message: string;
  slug?: string;
};

export function validateWikiTopic(topic: WikiTopic): WikiValidationIssue[] {
  const issues: WikiValidationIssue[] = [];
  const slug = topic.slug;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.slug)) {
    issues.push({
      code: "INVALID_SLUG",
      message: `Slug must be kebab-case alphanumeric: ${topic.slug}`,
      slug,
    });
  }

  for (const p of topic.prerequisites) {
    if (p === topic.slug) {
      issues.push({
        code: "SELF_PREREQ",
        message: "Topic cannot list itself as prerequisite",
        slug,
      });
    }
  }

  for (const r of topic.related) {
    if (r === topic.slug) {
      issues.push({
        code: "SELF_RELATED",
        message: "Topic cannot list itself as related",
        slug,
      });
    }
  }

  return issues;
}

export function validateWikiCorpus(
  manifest: WikiManifest,
  topicsBySlug: Map<string, WikiTopic>
): WikiValidationIssue[] {
  const issues: WikiValidationIssue[] = [];

  if (!isWikiManifest(manifest)) {
    issues.push({ code: "BAD_MANIFEST", message: "Manifest failed schema check" });
    return issues;
  }

  const slugsFromManifest = new Set<string>();
  for (const row of manifest.topics) {
    if (slugsFromManifest.has(row.slug)) {
      issues.push({
        code: "DUPLICATE_MANIFEST_SLUG",
        message: `Duplicate slug in manifest: ${row.slug}`,
        slug: row.slug,
      });
    }
    slugsFromManifest.add(row.slug);
  }

  for (const row of manifest.topics) {
    const full = topicsBySlug.get(row.slug);
    if (!full) {
      issues.push({
        code: "MISSING_TOPIC_FILE",
        message: `No topic payload for slug: ${row.slug}`,
        slug: row.slug,
      });
      continue;
    }
    if (!isWikiTopic(full)) {
      issues.push({
        code: "BAD_TOPIC",
        message: `Topic JSON invalid for slug: ${row.slug}`,
        slug: row.slug,
      });
      continue;
    }
    issues.push(...validateWikiTopic(full));
  }

  for (const [slug, topic] of topicsBySlug) {
    if (!slugsFromManifest.has(slug)) {
      issues.push({
        code: "ORPHAN_TOPIC",
        message: `Topic file exists but not in manifest: ${slug}`,
        slug,
      });
    }

    for (const p of topic.prerequisites) {
      if (!topicsBySlug.has(p)) {
        issues.push({
          code: "MISSING_PREREQ",
          message: `Unknown prerequisite slug: ${p}`,
          slug,
        });
      }
    }
    for (const r of topic.related) {
      if (!topicsBySlug.has(r)) {
        issues.push({
          code: "MISSING_RELATED",
          message: `Unknown related slug: ${r}`,
          slug,
        });
      }
    }
  }

  return issues;
}

export function assertNoValidationIssues(issues: WikiValidationIssue[]): void {
  if (issues.length === 0) return;
  const msg = issues.map((i) => `[${i.code}] ${i.message}`).join("\n");
  throw new Error(`ML Wiki validation failed:\n${msg}`);
}

export function validateWikiPaths(
  paths: WikiPathsFile,
  manifest: WikiManifest
): WikiValidationIssue[] {
  const issues: WikiValidationIssue[] = [];
  if (!isWikiPathsFile(paths)) {
    issues.push({ code: "BAD_PATHS_FILE", message: "paths.json failed schema check" });
    return issues;
  }
  const slugs = new Set(manifest.topics.map((t) => t.slug));
  const pathSlugs = new Set<string>();
  for (const p of paths.paths) {
    if (pathSlugs.has(p.slug)) {
      issues.push({
        code: "DUPLICATE_PATH_SLUG",
        message: `Duplicate learning path slug: ${p.slug}`,
      });
    }
    pathSlugs.add(p.slug);
    // Note: Since topics are dynamically resolved, we don't validate explicit topicSlugs anymore.
  }
  return issues;
}
