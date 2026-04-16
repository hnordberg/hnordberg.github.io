"use client";

import Link from "next/link";
import { useMemo } from "react";
import { countDue, type CardCandidate } from "../lib/deck";
import { useSrs } from "./useSrs";

type PathStudyButtonProps = {
  pathSlug: string;
  /** Candidates for this path only (resolved server-side). */
  candidates: CardCandidate[];
};

/**
 * Button rendered on a Path detail page. Shows due/new counts for the path
 * and links into /ml/wiki/study?path=<slug>.
 */
export function PathStudyButton({ pathSlug, candidates }: PathStudyButtonProps) {
  const { state, hydrated } = useSrs();
  const counts = useMemo(
    () => (hydrated ? countDue(candidates, state) : null),
    [hydrated, state, candidates]
  );

  const summary = hydrated && counts
    ? `${counts.dueReviews} due · ${counts.newAvailable} new`
    : `${candidates.length} cards`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
        margin: "1rem 0 1.5rem",
        padding: "0.75rem 1rem",
        borderRadius: "6px",
        border: "1px solid rgba(33, 150, 243, 0.35)",
        background: "rgba(33, 150, 243, 0.06)",
      }}
    >
      <div style={{ flex: "1 1 auto", minWidth: "10rem" }}>
        <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>Study this path with flashcards</div>
        <div style={{ fontSize: "0.8rem", opacity: 0.75 }}>{summary}</div>
      </div>
      <Link
        href={`/ml/wiki/study?path=${encodeURIComponent(pathSlug)}`}
        className="wiki-topic-nav-btn"
        style={{ padding: "0 1.1rem", height: "2.5rem" }}
      >
        Study →
      </Link>
    </div>
  );
}
