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

function isSrsState(value: unknown): value is SrsState {
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

/**
 * Load SRS state from localStorage. Unknown schema versions are discarded
 * silently so a future migration can reset cleanly.
 */
export function loadSrs(): SrsState {
  if (!isBrowser()) return emptyState();
  try {
    const raw = window.localStorage.getItem(SRS_STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!isSrsState(parsed)) return emptyState();
    // Defensive: ensure required settings keys exist (forward-compat if we
    // add new settings later without bumping the schema version).
    parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
    return parsed;
  } catch {
    return emptyState();
  }
}

export function saveSrs(state: SrsState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or serialization error; fail silently.
  }
}

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
