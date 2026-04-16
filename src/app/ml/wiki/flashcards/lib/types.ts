/**
 * Feature-local types for the flashcards / SRS subsystem.
 *
 * Kept separate from `../../types.ts` so the feature can be removed by
 * deleting this directory without touching the shared wiki contract.
 */

export const RATING_AGAIN = 0;
export const RATING_HARD = 1;
export const RATING_GOOD = 2;
export const RATING_EASY = 3;

export type Rating =
  | typeof RATING_AGAIN
  | typeof RATING_HARD
  | typeof RATING_GOOD
  | typeof RATING_EASY;

export const RATING_LABELS: Record<Rating, string> = {
  [RATING_AGAIN]: "Again",
  [RATING_HARD]: "Hard",
  [RATING_GOOD]: "Good",
  [RATING_EASY]: "Easy",
};

export type CardPhase = "new" | "learning" | "review" | "relearning";

export type CardState = {
  noteId: string;
  topicSlug: string;
  phase: CardPhase;
  /** ISO timestamp when this card is next due. */
  dueAt: string;
  /** Interval length in days (only meaningful once the card is in `review`). */
  intervalD: number;
  /** Index into `settings.learningStepsMin` while in learning / relearning. */
  stepIdx?: number;
  /** SM-2 ease factor. */
  ease: number;
  /** Successful reviews since the last lapse. */
  reps: number;
  /** Times the card has been forgotten in `review`. */
  lapses: number;
  lastRating?: Rating;
  lastReviewedAt?: string;
  leech?: boolean;
};

export type SrsSettings = {
  newPerDay: number;
  reviewsPerDay: number;
  learningStepsMin: number[];
  graduatingIntervalD: number;
  easyIntervalD: number;
  startingEase: number;
  minEase: number;
  leechThreshold: number;
};

export type DailyStats = {
  newSeen: number;
  reviewed: number;
  correct: number;
};

export type SrsState = {
  version: 1;
  cards: Record<string, CardState>;
  daily: Record<string, DailyStats>;
  settings: SrsSettings;
};

/** Minimal shape we need from a `WikiCard`. Keeps lib/ React-free. */
export type CardRef = {
  noteId: string;
  topicSlug: string;
};

export type DeckFilter = {
  pathSlug?: string;
  tag?: string;
  topicSlug?: string;
};

export const DEFAULT_SETTINGS: SrsSettings = {
  newPerDay: 10,
  reviewsPerDay: 100,
  learningStepsMin: [1, 10],
  graduatingIntervalD: 1,
  easyIntervalD: 4,
  startingEase: 2.5,
  minEase: 1.3,
  leechThreshold: 8,
};

export const SRS_STORAGE_KEY = "wiki-srs-v1";
export const SRS_STATE_VERSION = 1 as const;
