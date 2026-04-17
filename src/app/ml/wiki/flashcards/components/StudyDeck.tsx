"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMathJax } from "../../../../components/MathJax";
import { buildQueue, nextDueAt, type CardCandidate, type QueueItem } from "../lib/deck";
import { formatInterval } from "../lib/scheduler";
import { RATING_AGAIN, type Rating } from "../lib/types";
import { FlashCard, type FlashCardData } from "./FlashCard";
import { useSrs } from "./useSrs";

/**
 * Minimal per-card data StudyDeck needs from the caller. The caller
 * (StudySession) resolves these from the manifest + filter.
 */
export type StudyCardInput = FlashCardData;

type StudyDeckProps = {
  /** All candidate cards for this session, in stable order. */
  cards: StudyCardInput[];
  /** Human-readable label (e.g. "Path: Core Foundations" or "All topics"). */
  scopeLabel: string;
  /** Optional "Back to X" link shown in the empty/done state. */
  backHref?: string;
  backLabel?: string;
};

type SessionStats = {
  reviewed: number;
  correct: number;
  startedAt: number;
};

export function StudyDeck({ cards, scopeLabel, backHref, backLabel }: StudyDeckProps) {
  const srs = useSrs();
  const containerRef = useRef<HTMLDivElement>(null);
  const { MathJaxScript } = useMathJax(containerRef);

  const candidates = useMemo<CardCandidate[]>(
    () => cards.map((c) => ({ noteId: c.noteId, topicSlug: c.topicSlug })),
    [cards]
  );

  const cardById = useMemo(() => {
    const m = new Map<string, StudyCardInput>();
    for (const c of cards) m.set(c.noteId, c);
    return m;
  }, [cards]);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [cursor, setCursor] = useState(0);
  const [stats, setStats] = useState<SessionStats>(() => ({
    reviewed: 0,
    correct: 0,
    startedAt: Date.now(),
  }));
  const [queueBuilt, setQueueBuilt] = useState(false);

  // Build the queue once, after SRS state has hydrated. We intentionally do
  // NOT rebuild on every rate: that would cause re-ordering mid-session,
  // which is disorienting. Learning/relearning cards that become due during
  // the session are re-queued manually below.
  useEffect(() => {
    if (!srs.hydrated) return;
    const q = buildQueue({ candidates, state: srs.state });
    setQueue(q);
    setCursor(0);
    setStats({ reviewed: 0, correct: 0, startedAt: Date.now() });
    setQueueBuilt(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srs.hydrated, candidates]);

  const current = queue[cursor] ?? null;
  const flashData = current ? cardById.get(current.noteId) ?? null : null;

  const handleRate = useCallback(
    (rating: Rating) => {
      if (!current || !flashData) return;
      const updated = srs.rate(current.noteId, current.topicSlug, rating);
      setStats((s) => ({
        ...s,
        reviewed: s.reviewed + 1,
        correct: s.correct + (rating !== RATING_AGAIN ? 1 : 0),
      }));
      setQueue((q) => {
        const next = [...q];
        // Replace the current item with the updated state so the queue stays
        // in sync if we re-insert it.
        next[cursor] = { ...next[cursor]!, state: updated };
        // If the card is still in a learning/relearning phase, re-queue it
        // a few positions later so the user keeps seeing it within the
        // session until it graduates.
        if (updated.phase === "learning" || updated.phase === "relearning") {
          const insertAt = Math.min(next.length, cursor + 3);
          const [item] = next.splice(cursor, 1);
          if (item) next.splice(insertAt - 1, 0, item);
          // Leaving cursor unchanged points us at the next card already,
          // since we removed the current one.
          return next;
        }
        return next;
      });
      // Only advance the cursor when the card is fully retired from the
      // session (not re-queued). When it's re-queued we already spliced it
      // out at the cursor, so the same index now points at the next card.
      if (!(updated.phase === "learning" || updated.phase === "relearning")) {
        setCursor((c) => c + 1);
      }
    },
    [current, flashData, srs, cursor]
  );

  const handleUndo = useCallback(() => {
    const undone = srs.undo();
    if (!undone) return;
    // Step back one card if we've advanced past it.
    setCursor((c) => Math.max(0, c - 1));
    setStats((s) => ({
      ...s,
      reviewed: Math.max(0, s.reviewed - 1),
    }));
  }, [srs]);

  if (!srs.hydrated || !queueBuilt) {
    return (
      <div ref={containerRef}>
        <MathJaxScript />
        <p style={{ textAlign: "center", padding: "2rem", opacity: 0.7 }}>
          Loading flashcards…
        </p>
      </div>
    );
  }

  // Session complete / no cards.
  if (!current || !flashData) {
    const upcoming = nextDueAt(candidates, srs.state);
    const sessionEnded = queue.length > 0;
    return (
      <div ref={containerRef}>
        <MathJaxScript />
        <div
          className="card"
          style={{ padding: "2rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <h2 className="wiki-section-heading" style={{ marginTop: 0 }}>
            {sessionEnded ? "Session complete" : "Nothing to review"}
          </h2>
          {sessionEnded ? (
            <SessionSummary stats={stats} />
          ) : candidates.length === 0 ? (
            <p style={{ opacity: 0.75 }}>
              No flashcards in scope: <strong>{scopeLabel}</strong>.
            </p>
          ) : (
            <p style={{ opacity: 0.75 }}>
              All caught up in scope: <strong>{scopeLabel}</strong>.
              {upcoming ? (
                <>
                  <br />
                  Next card due in{" "}
                  <strong>
                    {formatInterval(
                      Math.max(0, (upcoming.getTime() - Date.now()) / 60000)
                    )}
                  </strong>
                  .
                </>
              ) : null}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            {backHref ? (
              <Link href={backHref} className="wiki-topic-nav-btn" style={{ padding: "0 1rem", height: "2.5rem" }}>
                {backLabel ?? "Back"}
              </Link>
            ) : null}
            <Link href="/ml/wiki" className="wiki-topic-nav-btn" style={{ padding: "0 1rem", height: "2.5rem" }}>
              Wiki home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = queue.length;
  const done = Math.min(cursor, total);
  const pct = total > 0 ? (done / total) * 100 : 0;
  const accuracy = stats.reviewed > 0 ? (stats.correct / stats.reviewed) * 100 : 100;

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <MathJaxScript />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          fontSize: "0.85rem",
          opacity: 0.85,
        }}
      >
        <div>
          <strong>{scopeLabel}</strong> · Card {done + 1} of {total}
        </div>
        <div>
          Reviewed: {stats.reviewed} · Accuracy: {Math.round(accuracy)}%
        </div>
      </div>
      <div
        style={{
          height: "4px",
          width: "100%",
          backgroundColor: "rgba(33, 150, 243, 0.15)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: "#2196F3",
            transition: "width 0.25s ease",
          }}
        />
      </div>

      <FlashCard
        card={flashData}
        state={current.state}
        settings={srs.state.settings}
        isNew={current.isNew}
        onRate={handleRate}
        onUndo={handleUndo}
        canUndo={srs.canUndo}
      />

      <p
        className="wiki-flashcard-kbd-hint"
        style={{
          fontSize: "0.75rem",
          opacity: 0.55,
          textAlign: "center",
          margin: 0,
        }}
      >
        Shortcuts: Space = reveal · 1 Again · 2 Hard · 3 Good · 4 Easy · U = undo
      </p>
    </div>
  );
}

function SessionSummary({ stats }: { stats: SessionStats }) {
  const mins = Math.max(1, Math.round((Date.now() - stats.startedAt) / 60000));
  const accuracy =
    stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "1rem",
        margin: "0.5rem auto 1rem",
        maxWidth: "24rem",
      }}
    >
      <Stat label="Reviewed" value={`${stats.reviewed}`} />
      <Stat label="Accuracy" value={`${accuracy}%`} />
      <Stat label="Time" value={`${mins}m`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
      <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2196F3" }}>{value}</span>
      <span style={{ fontSize: "0.75rem", opacity: 0.7, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}
