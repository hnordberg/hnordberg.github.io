"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { countDue, type CardCandidate } from "../lib/deck";
import { applyRating, initialCardState } from "../lib/scheduler";
import {
  emptyState,
  getDaily,
  isSrsState,
  todayKey,
  withCard,
  withDaily,
} from "../lib/storage";
import {
  DEFAULT_SETTINGS,
  RATING_AGAIN,
  RATING_EASY,
  RATING_GOOD,
  RATING_HARD,
  type CardState,
  type Rating,
  type SrsState,
} from "../lib/types";
import { useAuth } from "../../../../lib/AuthContext";
import { db } from "../../../../lib/firebase";

const UNDO_DEPTH = 10;

type UndoEntry = {
  prevCard: CardState | undefined;
  prevDailyKey: string;
  prevDaily: ReturnType<typeof getDaily>;
  noteId: string;
};

export type UseSrsResult = {
  /** True once we've hydrated from Firestore; false during SSR + first paint or while waiting for Auth. */
  hydrated: boolean;
  state: SrsState;
  rate(noteId: string, topicSlug: string, rating: Rating): CardState;
  undo(): string | null;
  canUndo: boolean;
  ensureCards(cards: CardCandidate[]): void;
  dueCountFor(candidates: CardCandidate[]): { dueReviews: number; newAvailable: number };
};

/**
 * React hook wrapping the SRS state.
 * Syncs in real-time with Firestore using standard optimistic updates.
 */
export function useSrs(): UseSrsResult {
  const { user } = useAuth();
  const [state, setState] = useState<SrsState>(() => emptyState());
  const [hydrated, setHydrated] = useState(false);
  const undoStack = useRef<UndoEntry[]>([]);
  const [, forceRerender] = useState(0);

  useEffect(() => {
    if (!user) {
      setHydrated(false);
      return;
    }

    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.srs && isSrsState(data.srs)) {
          // Defensive merge of settings
          data.srs.settings = { ...DEFAULT_SETTINGS, ...data.srs.settings };
          setState(data.srs as SrsState);
        } else {
          // Use current state if remote doc is initialized but lacks SRS prop
          // Usually we want emptyState but to avoid clobbering optimistic writes,
          // it's safer to only override if it's truly broken.
          if (!data.srs) setState(emptyState());
        }
      } else {
        setState(emptyState());
      }
      setHydrated(true);
    });

    return () => unsubscribe();
  }, [user]);

  const saveToFirestore = useCallback((nextState: SrsState) => {
    if (!user) return;
    setDoc(doc(db, "users", user.uid), {
      srs: nextState,
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch((err) => {
      console.error("Failed to save SRS state to Firestore", err);
    });
  }, [user]);

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
      saveToFirestore(nextState);
      forceRerender((n) => n + 1);
      return updated;
    },
    [state, saveToFirestore]
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
      saveToFirestore(next);
      return next;
    });
    forceRerender((n) => n + 1);
    return last.noteId;
  }, [saveToFirestore]);

  const ensureCards = useCallback((_cards: CardCandidate[]) => {
    // Currently a no-op
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
