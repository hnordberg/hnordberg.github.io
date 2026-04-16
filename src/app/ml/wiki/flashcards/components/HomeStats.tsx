"use client";

import Link from "next/link";
import { useMemo } from "react";
import { countDue, type CardCandidate } from "../lib/deck";
import { todayKey, getDaily } from "../lib/storage";
import { useSrs } from "./useSrs";

type HomeStatsProps = {
  /** All flashcard candidates across the whole wiki (precomputed server-side). */
  candidates: CardCandidate[];
};

/**
 * Wiki landing-page widget: shows due-today / new-available counts plus a
 * CTA to the study route. Renders skeleton numbers before hydration so the
 * static HTML never advertises incorrect counts.
 */
export function HomeStats({ candidates }: HomeStatsProps) {
  const { state, hydrated } = useSrs();

  const counts = useMemo(
    () => (hydrated ? countDue(candidates, state) : null),
    [hydrated, candidates, state]
  );

  const reviewedToday = hydrated
    ? getDaily(state, todayKey()).reviewed
    : null;

  return (
    <div className="card">
      <Link href="/ml/wiki/study" className="card-title wiki-hub-card-heading-link">
        Flashcards
      </Link>
      <div className="card-text">
        <p style={{ marginTop: 0, marginBottom: "0.75rem", opacity: 0.85 }}>
          Self-test with spaced repetition across every topic in the wiki.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <StatPill label="Due now" value={hydrated && counts ? counts.dueReviews : "—"} accent />
          <StatPill label="New" value={hydrated && counts ? counts.newAvailable : "—"} />
          <StatPill label="Today" value={hydrated && reviewedToday !== null ? reviewedToday : "—"} />
        </div>
        <Link
          href="/ml/wiki/study"
          className="wiki-topic-nav-btn"
          style={{ display: "inline-flex", padding: "0 1rem", height: "2.25rem", fontSize: "0.85rem" }}
        >
          Start review →
        </Link>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.1rem",
        padding: "0.45rem 0.25rem",
        borderRadius: "6px",
        border: `1px solid ${accent ? "rgba(33, 150, 243, 0.45)" : "rgba(0, 0, 0, 0.12)"}`,
        background: accent ? "rgba(33, 150, 243, 0.08)" : "transparent",
      }}
    >
      <span
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: accent ? "#1976D2" : "inherit",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: "0.65rem", letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.7 }}>
        {label}
      </span>
    </div>
  );
}
