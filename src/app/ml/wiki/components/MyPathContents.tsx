"use client";

import Link from "next/link";
import { useMemo } from "react";
import { sortTopics } from "../lib/paths";
import type { WikiManifest, WikiTopicIndexEntry } from "../types";
import { useWikiProgress } from "./useWikiProgress";
import { WikiPathSteps } from "./WikiPathSteps";

type MyPathContentsProps = {
  manifest: WikiManifest;
};

export function MyPathContents({ manifest }: MyPathContentsProps) {
  const { customPathSlugs } = useWikiProgress();

  const topics = useMemo<WikiTopicIndexEntry[]>(() => {
    if (customPathSlugs.size === 0) return [];
    const bySlug = new Map(manifest.topics.map((t) => [t.slug, t]));
    const resolved: WikiTopicIndexEntry[] = [];
    for (const slug of customPathSlugs) {
      const entry = bySlug.get(slug);
      if (entry) resolved.push(entry);
    }
    return sortTopics(resolved);
  }, [manifest.topics, customPathSlugs]);

  if (topics.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          border: "1px dashed var(--color-base-300)",
          borderRadius: "8px",
          color: "var(--color-base-500)",
        }}
      >
        <p style={{ marginBottom: "0.75rem" }}>
          Your custom path is empty.
        </p>
        <p>
          Browse the <Link href="/ml/wiki/topics">topics index</Link> and check
          the &ldquo;My path&rdquo; box on any topic to add it here.
        </p>
      </div>
    );
  }

  return <WikiPathSteps pathSlug="my" topics={topics} />;
}
