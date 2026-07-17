/**
 * Trip metrics for the summary sheet — pure, computed from a TripSession.
 * Distance runs a spike filter (bad-accuracy or impossible-speed pairs are
 * skipped); gaps come from the same >60 s rule that segments the trail, so
 * the kill-window demo is reported honestly.
 */
import { haversineMeters, SEGMENT_GAP_MS } from './geo';
import type { TripMetrics, TripSession } from '../types';

/** Distance pairs with either fix worse than this accuracy are skipped. */
const SPIKE_ACC_M = 100;
/** Distance pairs implying more than this speed (m/s) are skipped. */
const SPIKE_SPEED_MS = 70;

export function computeMetrics(session: TripSession): TripMetrics {
  const { fixes } = session;

  let distanceM = 0;
  let gapCount = 0;
  let gapMs = 0;
  for (let i = 1; i < fixes.length; i++) {
    const a = fixes[i - 1];
    const b = fixes[i];
    const dt = b.ts - a.ts;
    if (dt > SEGMENT_GAP_MS) {
      gapCount++;
      gapMs += dt;
      continue; // cross-gap pairs never count toward distance
    }
    if (a.acc > SPIKE_ACC_M || b.acc > SPIKE_ACC_M) continue;
    const d = haversineMeters(a, b);
    if (dt > 0 && d / (dt / 1000) > SPIKE_SPEED_MS) continue;
    distanceM += d;
  }

  let medianAccM: number | null = null;
  if (fixes.length > 0) {
    const accs = fixes.map((f) => f.acc).sort((x, y) => x - y);
    const mid = accs.length >> 1;
    medianAccM = accs.length % 2 ? accs[mid] : (accs[mid - 1] + accs[mid]) / 2;
  }

  const end = session.endedAt ?? Date.now();
  const batteryUsedPct =
    session.batteryStart != null && session.batteryEnd != null
      ? Math.max(0, (session.batteryStart - session.batteryEnd) * 100)
      : null;

  return {
    distanceM,
    fixCount: fixes.length,
    durationMs: Math.max(0, end - session.startedAt),
    gapCount,
    gapMs,
    medianAccM,
    batteryUsedPct,
    split: session.split,
  };
}
