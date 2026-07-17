/**
 * Single-file JSON persistence (documentDirectory/trip-session.json) via the
 * expo-file-system File API. Write cadence lives in the recorder (every 10
 * fixes or 5 s + on background + at stop); this module is just load/save.
 */
import { File, Paths } from 'expo-file-system';
import type { PersistedState } from '../types';

const FILE_NAME = 'trip-session.json';

function sessionFile(): File {
  return new File(Paths.document, FILE_NAME);
}

/** Local calendar day, YYYY-MM-DD (keys the today-usage accumulator). */
export function todayKey(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

export function emptyState(): PersistedState {
  return { session: null, usageDay: todayKey(), todayUsagePct: 0 };
}

/** Load persisted state; a missing/corrupt file resolves to a fresh state. */
export function loadState(): PersistedState {
  try {
    const file = sessionFile();
    if (!file.exists) return emptyState();
    const parsed = JSON.parse(file.textSync()) as PersistedState;
    if (typeof parsed !== 'object' || parsed === null) return emptyState();
    // day rollover: the accumulator only counts trips from today
    if (parsed.usageDay !== todayKey()) {
      parsed.usageDay = todayKey();
      parsed.todayUsagePct = 0;
    }
    return { session: parsed.session ?? null, usageDay: parsed.usageDay, todayUsagePct: parsed.todayUsagePct ?? 0 };
  } catch {
    return emptyState();
  }
}

export function saveState(state: PersistedState): void {
  try {
    sessionFile().write(JSON.stringify(state));
  } catch {
    // persistence is best-effort; the live UI keeps working without it
  }
}
