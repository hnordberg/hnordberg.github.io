"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { typesetMathInSubtree } from "../../../../components/MathJax";
import { formatInterval, nextIntervals } from "../lib/scheduler";
import {
  RATING_AGAIN,
  RATING_EASY,
  RATING_GOOD,
  RATING_HARD,
  RATING_LABELS,
  type CardState,
  type Rating,
  type SrsSettings,
} from "../lib/types";

export type FlashCardData = {
  noteId: string;
  topicSlug: string;
  topicTitle: string;
  /** Rendered question; usually the topic title. */
  prompt: ReactNode;
  /** The "core" answer the user should be able to recall unaided. */
  primaryAnswer: ReactNode;
  /** Optional extra sections shown behind a "Show more" expander. */
  extraAnswer?: ReactNode;
  tags: string[];
};

type FlashCardProps = {
  card: FlashCardData;
  state: CardState;
  settings: SrsSettings;
  isNew: boolean;
  onRate(rating: Rating): void;
  onUndo?: () => void;
  canUndo?: boolean;
};

const RATING_KEYS: Record<string, Rating> = {
  "1": RATING_AGAIN,
  "2": RATING_HARD,
  "3": RATING_GOOD,
  "4": RATING_EASY,
};

const RATING_ORDER: Rating[] = [RATING_AGAIN, RATING_HARD, RATING_GOOD, RATING_EASY];

const RATING_COLORS: Record<Rating, { bg: string; border: string; text: string }> = {
  [RATING_AGAIN]: { bg: "rgba(244, 67, 54, 0.12)", border: "rgba(244, 67, 54, 0.55)", text: "#E53935" },
  [RATING_HARD]:  { bg: "rgba(255, 152, 0, 0.12)", border: "rgba(255, 152, 0, 0.55)", text: "#F57C00" },
  [RATING_GOOD]:  { bg: "rgba(76, 175, 80, 0.12)", border: "rgba(76, 175, 80, 0.55)", text: "#2E7D32" },
  [RATING_EASY]:  { bg: "rgba(33, 150, 243, 0.12)", border: "rgba(33, 150, 243, 0.55)", text: "#1976D2" },
};

export function FlashCard({
  card,
  state,
  settings,
  isNew,
  onRate,
  onUndo,
  canUndo,
}: FlashCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const promptRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const extraRef = useRef<HTMLDivElement>(null);

  // Reset local UI state whenever the card changes.
  useEffect(() => {
    setRevealed(false);
    setExtraOpen(false);
  }, [card.noteId]);

  useEffect(() => {
    typesetMathInSubtree(promptRef.current);
  }, [card.prompt]);

  useEffect(() => {
    if (revealed) typesetMathInSubtree(answerRef.current);
  }, [revealed, card.primaryAnswer]);

  useEffect(() => {
    if (extraOpen) typesetMathInSubtree(extraRef.current);
  }, [extraOpen, card.extraAnswer]);

  const intervals = useMemo(
    () => nextIntervals(state, new Date(), settings),
    [state, settings]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        if (!revealed) {
          e.preventDefault();
          setRevealed(true);
        }
        return;
      }
      if (!revealed) return;
      const mapped = RATING_KEYS[e.key];
      if (mapped !== undefined) {
        e.preventDefault();
        onRate(mapped);
        return;
      }
      if ((e.key === "u" || e.key === "U") && canUndo && onUndo) {
        e.preventDefault();
        onUndo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, onRate, onUndo, canUndo]);

  const phaseBadge = phaseLabel(state.phase, isNew);
  const hasExtra = card.extraAnswer != null;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
              border: "1px solid rgba(33, 150, 243, 0.4)",
              color: "#1976D2",
              background: "rgba(33, 150, 243, 0.08)",
              fontWeight: 600,
            }}
          >
            {phaseBadge}
          </span>
          <Link
            href={`/ml/wiki/${card.topicSlug}`}
            style={{ fontSize: "0.85rem", color: "inherit", opacity: 0.75, textDecoration: "none" }}
            title="Open full topic page"
          >
            Full topic →
          </Link>
        </div>
        {onUndo && canUndo ? (
          <button
            type="button"
            onClick={onUndo}
            className="wiki-topic-nav-btn"
            style={{ height: "2rem", minWidth: "auto", padding: "0 0.7rem", fontSize: "0.8rem" }}
            aria-label="Undo last rating (U)"
            title="Undo (U)"
          >
            Undo
          </button>
        ) : null}
      </div>

      <div ref={promptRef} style={{ fontSize: "1.35rem", lineHeight: 1.35, fontWeight: 600 }}>
        {card.prompt}
      </div>

      {!revealed ? (
        <button
          type="button"
          className="wiki-topic-nav-btn"
          style={{ alignSelf: "center", padding: "0.6rem 1.75rem", height: "auto", fontSize: "0.95rem" }}
          onClick={() => setRevealed(true)}
          aria-label="Reveal answer (Space)"
        >
          Show answer (Space)
        </button>
      ) : (
        <>
          <div
            style={{
              borderTop: "1px dashed rgba(0,0,0,0.18)",
              paddingTop: "1rem",
            }}
          >
            <div
              ref={answerRef}
              className="wiki-card-answer"
              style={{ fontSize: "1rem", lineHeight: 1.6 }}
            >
              {card.primaryAnswer}
            </div>

            {hasExtra ? (
              <div style={{ marginTop: "0.75rem" }}>
                <button
                  type="button"
                  className="wiki-topic-nav-btn"
                  style={{ height: "2rem", padding: "0 0.85rem", fontSize: "0.8rem" }}
                  aria-expanded={extraOpen}
                  onClick={() => setExtraOpen((o) => !o)}
                >
                  {extraOpen ? "Hide details ▴" : "Dig deeper ▾"}
                </button>
                {extraOpen ? (
                  <div
                    ref={extraRef}
                    style={{
                      marginTop: "0.75rem",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid rgba(0,0,0,0.08)",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {card.extraAnswer}
                  </div>
                ) : null}
              </div>
            ) : null}

            {card.tags.length > 0 ? (
              <div className="wiki-card-tags" style={{ marginTop: "0.85rem" }}>
                {card.tags.map((t) => (
                  <span key={t} className="wiki-card-tag">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div
            role="group"
            aria-label="Rate this card"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            {RATING_ORDER.map((r, idx) => {
              const minutes = intervals[r];
              const label = RATING_LABELS[r];
              const c = RATING_COLORS[r];
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRate(r)}
                  aria-label={`${label}: next in ${formatInterval(minutes)} (shortcut ${idx + 1})`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.15rem",
                    padding: "0.7rem 0.5rem",
                    borderRadius: "6px",
                    border: `1px solid ${c.border}`,
                    background: c.bg,
                    color: c.text,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.15s, transform 0.05s",
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "";
                  }}
                >
                  <span style={{ fontSize: "0.65rem", opacity: 0.7, letterSpacing: "0.05em" }}>
                    [{idx + 1}]
                  </span>
                  <span style={{ fontSize: "0.95rem" }}>{label}</span>
                  <span style={{ fontSize: "0.75rem", opacity: 0.85, fontWeight: 500 }}>
                    {formatInterval(minutes)}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function phaseLabel(phase: CardState["phase"], isNew: boolean): string {
  if (isNew) return "New";
  switch (phase) {
    case "new":
      return "New";
    case "learning":
      return "Learning";
    case "relearning":
      return "Relearning";
    case "review":
      return "Review";
  }
}
