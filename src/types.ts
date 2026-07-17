/** Shared app types. */

/** Which screen/state the app is in. */
export type AppPhase = 'boot' | 'permission' | 'live' | 'idle' | 'summary';

/**
 * Color arm for the map + instruments: the same elements render in every
 * phase, only their truth changes (live blue / grey off / ended red-arrival /
 * setup = no trail yet).
 */
export type ColorArm = 'live' | 'off' | 'ended' | 'setup';

/** One recorded GPS fix (subset of the SDK's LocationEvent we persist). */
export interface TripFix {
  lat: number;
  lng: number;
  /** accuracy, meters */
  acc: number;
  /** epoch ms */
  ts: number;
}

/** Trail = list of gap-free segments (a >60 s fix gap starts a new segment). */
export type TrailSegments = TripFix[][];

/** Motion-split bucket (SDK activities collapse into these three). */
export type MotionBucket = 'driving' | 'walking' | 'still';

/** One trip, as recorded and persisted. */
export interface TripSession {
  active: boolean;
  /** epoch ms */
  startedAt: number;
  /** epoch ms; set at stop */
  endedAt?: number;
  /** true once the summary's Done was tapped (idle keeps the ghost trail) */
  dismissed: boolean;
  fixes: TripFix[];
  /** ms spent in each motion bucket */
  split: Record<MotionBucket, number>;
  /** battery level 0..1 at start; null when unavailable */
  batteryStart: number | null;
  /** battery level 0..1 at stop */
  batteryEnd?: number | null;
}

/** The single persisted JSON blob (documentDirectory/trip-session.json). */
export interface PersistedState {
  session: TripSession | null;
  /** calendar day (YYYY-MM-DD) `todayUsagePct` belongs to */
  usageDay: string;
  /** battery % used by trips that day (positive number) */
  todayUsagePct: number;
}

/** Everything the summary sheet shows, computed from a TripSession. */
export interface TripMetrics {
  distanceM: number;
  fixCount: number;
  durationMs: number;
  gapCount: number;
  /** total ms inside fix gaps (>60 s holes) */
  gapMs: number;
  medianAccM: number | null;
  /** battery % used during the trip (positive), null when unavailable */
  batteryUsedPct: number | null;
  split: Record<MotionBucket, number>;
}
