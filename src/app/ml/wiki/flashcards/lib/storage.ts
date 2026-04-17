/**
 * Versioned localStorage persistence for the SRS state.
 * SSR-safe: every function guards on `typeof window`.
 */

import {
  DEFAULT_SETTINGS,
  SRS_STATE_VERSION,
  SRS_STORAGE_KEY,
  type CardState,
  type DailyStats,
  type SrsSettings,
  type SrsState,
} from "./types";

export function emptyState(settings: SrsSettings = DEFAULT_SETTINGS): SrsState {
  return {
    version: SRS_STATE_VERSION,
    cards: {},
    daily: {},
    settings: { ...settings },
  };
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function isSrsState(value: unknown): value is SrsState {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<SrsState>;
  return (
    v.version === SRS_STATE_VERSION &&
    !!v.cards &&
    typeof v.cards === "object" &&
    !!v.daily &&
    typeof v.daily === "object" &&
    !!v.settings &&
    typeof v.settings === "object"
  );
}

// loadSrs and saveSrs have been replaced by Firestore sync in useSrs.ts

/** Today's local-date key, YYYY-MM-DD. */
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDaily(state: SrsState, key: string): DailyStats {
  return state.daily[key] ?? { newSeen: 0, reviewed: 0, correct: 0 };
}

/**
 * Immutably update the state, then persist. Callers get the new state back
 * so they can set React state in one step.
 */
export function withCard(
  state: SrsState,
  noteId: string,
  card: CardState
): SrsState {
  return {
    ...state,
    cards: { ...state.cards, [noteId]: card },
  };
}

export function withDaily(
  state: SrsState,
  key: string,
  fn: (prev: DailyStats) => DailyStats
): SrsState {
  const prev = getDaily(state, key);
  return {
    ...state,
    daily: { ...state.daily, [key]: fn(prev) },
  };
}
