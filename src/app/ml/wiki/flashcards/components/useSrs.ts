"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { countDue, type CardCandidate } from "../lib/deck";
import { applyRating, initialCardState } from "../lib/scheduler";
import {
  emptyState,
  getDaily,
  loadSrs,
  saveSrs,
  todayKey,
  withCard,
  withDaily,
} from "../lib/storage";
import {
  RATING_AGAIN,
  RATING_EASY,
  RATING_GOOD,
  RATING_HARD,
  type CardState,
  type Rating,
  type SrsState,
} from "../lib/types";

const UNDO_DEPTH = 10;

type UndoEntry = {
  prevCard: CardState | undefined;
  prevDailyKey: string;
  prevDaily: ReturnType<typeof getDaily>;
  noteId: string;
};

export type UseSrsResult = {
  /** True once we've hydrated from localStorage; false during SSR + first paint. */
  hydrated: boolean;
  state: SrsState;
  rate(noteId: string, topicSlug: string, rating: Rating): CardState;
  undo(): string | null;
  canUndo: boolean;
  ensureCards(cards: CardCandidate[]): void;
  dueCountFor(candidates: CardCandidate[]): { dueReviews: number; newAvailable: number };
};

/**
 * React hook wrapping the SRS state. Mirrors the shape of `useWikiProgress`:
 * hydrates on mount, SSR-safe during first render.
 */
export function useSrs(): UseSrsResult {
  const [state, setState] = useState<SrsState>(() => emptyState());
  const [hydrated, setHydrated] = useState(false);
  const undoStack = useRef<UndoEntry[]>([]);
  const [, forceRerender] = useState(0);

  useEffect(() => {
    setState(loadSrs());
    setHydrated(true);
  }, []);

  const rate = useCallback(
    (noteId: string, topicSlug: string, rating: Rating): CardState => {
      const now = new Date();
      const key = todayKey(now);
      let nextState: SrsState = state;
      const prevCard = state.cards[noteId];
      const prevDaily = getDaily(state, key);

      const base = prevCard ?? initialCardState({ noteId, topicSlug }, state.settings);
      const wasNew = !prevCard || prevCard.phase === "new";
      const wasReview = prevCard?.phase === "review";
      const updated = applyRating(base, rating, now, state.settings);
      nextState = withCard(nextState, noteId, updated);

      const correct = rating !== RATING_AGAIN ? 1 : 0;
      nextState = withDaily(nextState, key, (d) => ({
        newSeen: d.newSeen + (wasNew ? 1 : 0),
        reviewed: d.reviewed + (wasReview || prevCard?.phase === "learning" || prevCard?.phase === "relearning" ? 1 : 0),
        correct: d.correct + correct,
      }));

      undoStack.current.push({ prevCard, prevDailyKey: key, prevDaily, noteId });
      if (undoStack.current.length > UNDO_DEPTH) {
        undoStack.current.shift();
      }

      setState(nextState);
      saveSrs(nextState);
      forceRerender((n) => n + 1);
      return updated;
    },
    [state]
  );

  const undo = useCallback((): string | null => {
    const last = undoStack.current.pop();
    if (!last) return null;
    setState((prev) => {
      const nextCards = { ...prev.cards };
      if (last.prevCard) {
        nextCards[last.noteId] = last.prevCard;
      } else {
        delete nextCards[last.noteId];
      }
      const nextDaily = { ...prev.daily, [last.prevDailyKey]: last.prevDaily };
      const next: SrsState = { ...prev, cards: nextCards, daily: nextDaily };
      saveSrs(next);
      return next;
    });
    forceRerender((n) => n + 1);
    return last.noteId;
  }, []);

  const ensureCards = useCallback((_cards: CardCandidate[]) => {
    // Currently a no-op: cards are seeded lazily via `buildQueue`
    // (`initialCardState`). We keep this in the hook API so that a future
    // change (e.g. eager instantiation for stats) can happen without
    // touching call sites.
  }, []);

  const dueCountFor = useCallback(
    (candidates: CardCandidate[]) => countDue(candidates, state),
    [state]
  );

  return useMemo<UseSrsResult>(
    () => ({
      hydrated,
      state,
      rate,
      undo,
      canUndo: undoStack.current.length > 0,
      ensureCards,
      dueCountFor,
    }),
    [hydrated, state, rate, undo, ensureCards, dueCountFor]
  );
}

export { RATING_AGAIN, RATING_EASY, RATING_GOOD, RATING_HARD };
