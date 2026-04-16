/**
 * Study queue construction.
 *
 * Given a pre-filtered pool of card candidates (the caller applies any
 * path / tag / topic filtering first), build the ordered study queue
 * respecting per-day new/review limits.
 */

import { initialCardState, isDue } from "./scheduler";
import { getDaily, todayKey } from "./storage";
import {
  DEFAULT_SETTINGS,
  type CardState,
  type SrsSettings,
  type SrsState,
} from "./types";

export type CardCandidate = {
  noteId: string;
  topicSlug: string;
};

export type QueueItem = {
  noteId: string;
  topicSlug: string;
  state: CardState;
  /** True if this is the card's very first appearance in the scheduler. */
  isNew: boolean;
};

export type BuildQueueInput = {
  candidates: CardCandidate[];
  state: SrsState;
  now?: Date;
  settings?: SrsSettings;
  /** Per-session limits; fall back to state.settings.newPerDay / reviewsPerDay. */
  limits?: { newPerDay?: number; reviewsPerDay?: number };
};

/** Compute remaining new/review budget, given today's usage so far. */
export function remainingToday(state: SrsState, now: Date = new Date()): {
  newRemaining: number;
  reviewRemaining: number;
} {
  const key = todayKey(now);
  const d = getDaily(state, key);
  const newRemaining = Math.max(0, state.settings.newPerDay - d.newSeen);
  const reviewRemaining = Math.max(0, state.settings.reviewsPerDay - d.reviewed);
  return { newRemaining, reviewRemaining };
}

/**
 * Build the ordered study queue.
 *
 * Order:
 *   1. Due learning / relearning cards (shortest-due first; these have
 *      minute-level intervals and should be revisited quickly).
 *   2. Due review cards, oldest-due first.
 *   3. Up to `newRemaining` new cards, in the order they were provided.
 *
 * Reviews are capped by `limits.reviewsPerDay`. New cards are capped by
 * `limits.newPerDay`. Callers can pass `Infinity` to disable caps
 * (useful for a future cram mode).
 */
export function buildQueue(input: BuildQueueInput): QueueItem[] {
  const {
    candidates,
    state,
    now = new Date(),
    settings = state.settings ?? DEFAULT_SETTINGS,
  } = input;

  const { newRemaining: defaultNewRem, reviewRemaining: defaultRevRem } =
    remainingToday(state, now);
  const newLimit =
    input.limits?.newPerDay !== undefined
      ? input.limits.newPerDay
      : defaultNewRem;
  const reviewLimit =
    input.limits?.reviewsPerDay !== undefined
      ? input.limits.reviewsPerDay
      : defaultRevRem;

  const learning: QueueItem[] = [];
  const reviews: QueueItem[] = [];
  const news: QueueItem[] = [];

  const seen = new Set<string>();
  for (const c of candidates) {
    if (seen.has(c.noteId)) continue;
    seen.add(c.noteId);

    const existing = state.cards[c.noteId];
    if (!existing) {
      news.push({
        noteId: c.noteId,
        topicSlug: c.topicSlug,
        state: initialCardState(c, settings),
        isNew: true,
      });
      continue;
    }

    if (!isDue(existing, now)) continue;

    const item: QueueItem = {
      noteId: c.noteId,
      topicSlug: c.topicSlug,
      state: existing,
      isNew: false,
    };

    if (existing.phase === "learning" || existing.phase === "relearning") {
      learning.push(item);
    } else if (existing.phase === "review") {
      reviews.push(item);
    } else {
      // phase === "new" but we have a stored state (rare: would only happen
      // if a card was seeded but never rated). Treat as a new card.
      news.push({ ...item, isNew: true });
    }
  }

  learning.sort(
    (a, b) => new Date(a.state.dueAt).getTime() - new Date(b.state.dueAt).getTime()
  );
  reviews.sort(
    (a, b) => new Date(a.state.dueAt).getTime() - new Date(b.state.dueAt).getTime()
  );

  const cappedReviews = reviews.slice(0, Math.max(0, reviewLimit));
  const cappedNews = news.slice(0, Math.max(0, newLimit));

  return [...learning, ...cappedReviews, ...cappedNews];
}

/** Count how many cards are due right now in a candidate pool. */
export function countDue(
  candidates: CardCandidate[],
  state: SrsState,
  now: Date = new Date()
): { dueReviews: number; newAvailable: number } {
  let dueReviews = 0;
  let newAvailable = 0;
  const seen = new Set<string>();
  for (const c of candidates) {
    if (seen.has(c.noteId)) continue;
    seen.add(c.noteId);
    const existing = state.cards[c.noteId];
    if (!existing) {
      newAvailable += 1;
      continue;
    }
    if (isDue(existing, now)) dueReviews += 1;
  }
  return { dueReviews, newAvailable };
}

/** Timestamp of the next card that will become due, or null if none. */
export function nextDueAt(
  candidates: CardCandidate[],
  state: SrsState,
  now: Date = new Date()
): Date | null {
  let best: number | null = null;
  const seen = new Set<string>();
  for (const c of candidates) {
    if (seen.has(c.noteId)) continue;
    seen.add(c.noteId);
    const existing = state.cards[c.noteId];
    if (!existing) continue;
    const t = new Date(existing.dueAt).getTime();
    if (t <= now.getTime()) return now; // something is already due
    if (best === null || t < best) best = t;
  }
  return best === null ? null : new Date(best);
}
