/** Mono-line / tile formatters. Numeric strings match the mockups exactly. */
import type { MotionBucket } from '../types';

/** U+2212 minus, as the mockups render ("−0.4%"). */
const MINUS = '−';

export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function formatAcc(meters: number): string {
  return `±${Math.round(meters)} m`;
}

/** Live mono-line age: "2 s" / "5 min". */
export function formatAge(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return s < 60 ? `${s} s` : `${Math.round(s / 60)} min`;
}

/** Idle mono-line age: "5 min ago" / "just now". */
export function formatAgeAgo(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return 'just now';
  const min = Math.round(s / 60);
  return min < 60 ? `${min} min ago` : `${Math.round(min / 60)} h ago`;
}

/** "3.2 km" (≥1 km) or "840 m". */
export function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

/** Duration tile: "14 min" ("<1 min" under a minute). */
export function formatDurationMin(ms: number): string {
  if (ms < 60_000) return '<1 min';
  return `${Math.round(ms / 60_000)} min`;
}

/** Duration tile sub: "no gaps" / "1 gap · 2 min" / "2 gaps · 4 min". */
export function formatGaps(count: number, gapMs: number): string {
  if (count === 0) return 'no gaps';
  const noun = count === 1 ? 'gap' : 'gaps';
  return `${count} ${noun} · ${formatDurationMin(gapMs)}`;
}

/** "driving 11 min · walking 3 min · still 0 min" (zero entries kept). */
export function formatSplit(split: Record<MotionBucket, number>): string {
  const min = (ms: number) => `${Math.round(ms / 60_000)} min`;
  return `driving ${min(split.driving)} · walking ${min(split.walking)} · still ${min(split.still)}`;
}

/** Battery used: "−0.4%" (positive input; U+2212 sign). */
export function formatUsedPct(pct: number): string {
  return `${MINUS}${Math.max(0, pct).toFixed(1)}%`;
}

/** Battery level: "87%". */
export function formatLevelPct(level: number): string {
  return `${Math.round(level * 100)}%`;
}

/** "09:27" (24 h, zero-padded). */
export function formatClock(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** "09:27 – 09:41" (en dash, per mockup). */
export function formatRange(startTs: number, endTs: number): string {
  return `${formatClock(startTs)} – ${formatClock(endTs)}`;
}
