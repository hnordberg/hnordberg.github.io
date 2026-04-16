"use client";

import Link from "next/link";
import { useMemo } from "react";
import { countDue, type CardCandidate } from "../lib/deck";
import { useSrs } from "./useSrs";

type TopicStudyButtonProps = {
  topicSlug: string;
  /** Cards for this topic, from `topic.cards`. */
  candidates: CardCandidate[];
};

/**
 * Small button rendered next to CardEvidence on a topic page. Links into
 * /ml/wiki/study?topic=<slug> so the session covers only this topic.
 */
export function TopicStudyButton({ topicSlug, candidates }: TopicStudyButtonProps) {
  const { state, hydrated } = useSrs();
  const counts = useMemo(
    () => (hydrated ? countDue(candidates, state) : null),
    [hydrated, state, candidates]
  );

  if (candidates.length === 0) return null;

  const status = hydrated && counts
    ? counts.dueReviews > 0
      ? "Due now"
      : counts.newAvailable > 0
        ? "New"
        : "Reviewed"
    : null;

  return (
    <div style={{ margin: "1rem 0", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.5rem" }}>
      {status ? (
        <span style={{ fontSize: "0.75rem", opacity: 0.7, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {status}
        </span>
      ) : null}
      <Link
        href={`/ml/wiki/study?topic=${encodeURIComponent(topicSlug)}`}
        className="wiki-topic-nav-btn"
        style={{ padding: "0 1rem", height: "2.25rem", fontSize: "0.85rem" }}
      >
        Study this topic →
      </Link>
    </div>
  );
}
