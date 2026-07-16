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
