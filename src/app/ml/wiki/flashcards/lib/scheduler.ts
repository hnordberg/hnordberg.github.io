/**
 * Pure SM-2 scheduler. No React, no storage, no side effects.
 *
 * All functions take explicit `now` and `settings` so they can be replayed
 * deterministically in tests and by the undo stack.
 */

import {
  DEFAULT_SETTINGS,
  RATING_AGAIN,
  RATING_EASY,
  RATING_GOOD,
  RATING_HARD,
  type CardRef,
  type CardState,
  type Rating,
  type SrsSettings,
} from "./types";

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;

export function initialCardState(ref: CardRef, settings: SrsSettings = DEFAULT_SETTINGS): CardState {
  return {
    noteId: ref.noteId,
    topicSlug: ref.topicSlug,
    phase: "new",
    dueAt: new Date(0).toISOString(),
    intervalD: 0,
    stepIdx: 0,
    ease: settings.startingEase,
    reps: 0,
    lapses: 0,
  };
}

export function isDue(card: CardState, now: Date = new Date()): boolean {
  return new Date(card.dueAt).getTime() <= now.getTime();
}

/** Clamp ease to the configured minimum. */
function clampEase(ease: number, settings: SrsSettings): number {
  return Math.max(settings.minEase, ease);
}

function addMinutes(now: Date, minutes: number): string {
  return new Date(now.getTime() + minutes * MS_PER_MINUTE).toISOString();
}

function addDays(now: Date, days: number): string {
  return new Date(now.getTime() + days * MS_PER_DAY).toISOString();
}

function currentStep(card: CardState, settings: SrsSettings): number {
  const steps = settings.learningStepsMin;
  if (steps.length === 0) return 0;
  const idx = card.stepIdx ?? 0;
  return steps[Math.min(idx, steps.length - 1)]!;
}

/**
 * Apply a rating to a card, returning a new `CardState`.
 *
 * Does not mutate the input. All date math uses `now`.
 */
export function applyRating(
  card: CardState,
  rating: Rating,
  now: Date = new Date(),
  settings: SrsSettings = DEFAULT_SETTINGS
): CardState {
  const next: CardState = {
    ...card,
    lastRating: rating,
    lastReviewedAt: now.toISOString(),
  };

  if (rating === RATING_AGAIN) {
    if (next.phase === "review") {
      next.lapses = next.lapses + 1;
      next.leech = next.lapses >= settings.leechThreshold ? true : next.leech;
    }
    next.phase = next.phase === "new" ? "learning" : "relearning";
    next.stepIdx = 0;
    next.reps = 0;
    next.ease = clampEase(next.ease - 0.2, settings);
    const firstStep = settings.learningStepsMin[0] ?? 1;
    next.dueAt = addMinutes(now, firstStep);
    return next;
  }

  if (next.phase === "new" || next.phase === "learning" || next.phase === "relearning") {
    if (rating === RATING_EASY) {
      next.phase = "review";
      next.stepIdx = undefined;
      next.intervalD = settings.easyIntervalD;
      next.reps = next.reps + 1;
      next.dueAt = addDays(now, next.intervalD);
      return next;
    }

    if (rating === RATING_GOOD) {
      const steps = settings.learningStepsMin;
      const idx = next.stepIdx ?? 0;
      const nextIdx = idx + 1;
      if (nextIdx >= steps.length) {
        next.phase = "review";
        next.stepIdx = undefined;
        next.intervalD = settings.graduatingIntervalD;
        next.reps = next.reps + 1;
        next.dueAt = addDays(now, next.intervalD);
      } else {
        next.stepIdx = nextIdx;
        next.dueAt = addMinutes(now, steps[nextIdx]!);
      }
      return next;
    }

    // Hard in a learning phase: stay on the same step.
    next.dueAt = addMinutes(now, currentStep(next, settings));
    return next;
  }

  // phase === "review"
  if (rating === RATING_HARD) {
    next.intervalD = Math.max(1, next.intervalD * 1.2);
    next.ease = clampEase(next.ease - 0.15, settings);
  } else if (rating === RATING_GOOD) {
    next.intervalD = Math.max(1, next.intervalD * next.ease);
  } else {
    // Easy
    next.intervalD = Math.max(1, next.intervalD * next.ease * 1.3);
    next.ease = next.ease + 0.15;
  }
  next.reps = next.reps + 1;
  next.dueAt = addDays(now, next.intervalD);
  return next;
}

/**
 * Compute the projected next-due interval for each rating, without mutating.
 * Used by the UI to show "Good -> 3d" labels on the rating buttons.
 *
 * Returns duration in minutes for each rating.
 */
export function nextIntervals(
  card: CardState,
  now: Date = new Date(),
  settings: SrsSettings = DEFAULT_SETTINGS
): Record<Rating, number> {
  const ratings: Rating[] = [RATING_AGAIN, RATING_HARD, RATING_GOOD, RATING_EASY];
  const out = {} as Record<Rating, number>;
  for (const r of ratings) {
    const projected = applyRating(card, r, now, settings);
    const ms = new Date(projected.dueAt).getTime() - now.getTime();
    out[r] = Math.max(0, Math.round(ms / MS_PER_MINUTE));
  }
  return out;
}

/** Human-readable formatting, e.g. "10m", "1h", "3d", "2mo". */
export function formatInterval(minutes: number): string {
  if (!isFinite(minutes) || minutes <= 0) return "<1m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)}d`;
  const months = days / 30;
  if (months < 12) return `${Math.round(months)}mo`;
  const years = days / 365;
  return `${years.toFixed(1)}y`;
}
