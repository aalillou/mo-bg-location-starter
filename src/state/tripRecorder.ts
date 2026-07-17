/**
 * Non-React hot path: fix buffer, motion split, battery baseline, gap-aware
 * trail. Receives every SDK event; React gets ~1/s throttled snapshots via
 * `onSnapshot`. Persists every 10 fixes or 5 s (plus on background + at stop).
 */
import type { ActivityType, LocationEvent, MotionEvent } from '@aalillou/mo-bg-location';
import { appendFix } from '../lib/geo';
import { saveState, todayKey } from './persistence';
import type { MotionBucket, PersistedState, TrailSegments, TripFix, TripSession } from '../types';

/** Fix buffer cap: ~3 h at 1 Hz. */
const MAX_FIXES = 10_800;
/** React snapshot throttle. */
const SNAPSHOT_MS = 1_000;
/** Persist cadence: whichever comes first. */
const PERSIST_EVERY_FIXES = 10;
const PERSIST_EVERY_MS = 5_000;

export interface RecorderSnapshot {
  session: TripSession | null;
  /** Derived trail; outer array identity changes on every snapshot. */
  segments: TrailSegments;
  lastFix?: TripFix;
  /** Current motion bucket (drives the headline chip while live). */
  bucket: MotionBucket;
  /** Battery % used by trips today (persisted accumulator). */
  todayUsagePct: number;
}

/** in_vehicle|on_bicycle → driving · walking|running|on_foot → walking · still → still · unknown keeps previous. */
export function bucketOf(activity: ActivityType, prev: MotionBucket): MotionBucket {
  switch (activity) {
    case 'in_vehicle':
    case 'on_bicycle':
      return 'driving';
    case 'walking':
    case 'running':
    case 'on_foot':
      return 'walking';
    case 'still':
      return 'still';
    default:
      return prev;
  }
}

export class TripRecorder {
  private session: TripSession | null = null;
  private segments: TrailSegments = [];
  private bucket: MotionBucket = 'still';
  private lastAccrueTs = 0;
  private usageDay = todayKey();
  private todayUsagePct = 0;

  private fixesSinceSave = 0;
  private lastSaveTs = 0;
  private lastNotifyTs = 0;
  private notifyTimer: ReturnType<typeof setTimeout> | null = null;

  /** React subscriber (single — the App). */
  onSnapshot: ((snap: RecorderSnapshot) => void) | null = null;

  /** Adopt persisted state on cold start (rebuilds the trail from fixes). */
  adopt(state: PersistedState): void {
    this.usageDay = state.usageDay;
    this.todayUsagePct = state.todayUsagePct;
    this.session = state.session;
    this.segments = [];
    if (this.session) {
      for (const fix of this.session.fixes) appendFix(this.segments, fix);
    }
    // a restored live session resumes accruing from now (the kill window is a
    // fix gap, reported honestly — not silently backfilled into a bucket)
    this.lastAccrueTs = Date.now();
  }

  startTrip(batteryLevel: number | null): void {
    this.session = {
      active: true,
      startedAt: Date.now(),
      dismissed: false,
      fixes: [],
      split: { driving: 0, walking: 0, still: 0 },
      batteryStart: batteryLevel,
    };
    this.segments = [];
    this.bucket = 'still';
    this.lastAccrueTs = this.session.startedAt;
    this.persistNow();
    this.notify(true);
  }

  stopTrip(batteryLevel: number | null): void {
    if (!this.session?.active) return;
    this.accrue(Date.now());
    this.session.active = false;
    this.session.endedAt = Date.now();
    this.session.batteryEnd = batteryLevel;
    if (this.session.batteryStart != null && batteryLevel != null) {
      this.rollUsageDay();
      this.todayUsagePct += Math.max(0, (this.session.batteryStart - batteryLevel) * 100);
    }
    this.persistNow();
    this.notify(true);
  }

  dismiss(): void {
    if (!this.session) return;
    this.session.dismissed = true;
    this.persistNow();
    this.notify(true);
  }

  onFix(e: LocationEvent): void {
    if (!this.session?.active) return;
    const fix: TripFix = { lat: e.latitude, lng: e.longitude, acc: e.accuracy, ts: e.timestamp };
    if (this.session.fixes.length >= MAX_FIXES) return; // ~3 h cap; demo trips end long before
    this.session.fixes.push(fix);
    appendFix(this.segments, fix);
    this.accrue(Date.now());
    this.bucket = bucketOf(e.activity, this.bucket);
    if (++this.fixesSinceSave >= PERSIST_EVERY_FIXES || Date.now() - this.lastSaveTs >= PERSIST_EVERY_MS) {
      this.persistNow();
    }
    this.notify();
  }

  onMotion(e: MotionEvent): void {
    if (!this.session?.active) return;
    this.accrue(Date.now());
    this.bucket = bucketOf(e.activity, this.bucket);
    this.notify();
  }

  snapshot(): RecorderSnapshot {
    const lastSeg = this.segments[this.segments.length - 1];
    return {
      session: this.session,
      segments: [...this.segments],
      lastFix: lastSeg?.[lastSeg.length - 1],
      bucket: this.bucket,
      todayUsagePct: this.todayUsagePct,
    };
  }

  /** Immediate write — called on AppState→background and at trip boundaries. */
  persistNow(): void {
    this.fixesSinceSave = 0;
    this.lastSaveTs = Date.now();
    const state: PersistedState = {
      session: this.session,
      usageDay: this.usageDay,
      todayUsagePct: this.todayUsagePct,
    };
    saveState(state);
  }

  /** Add elapsed time to the current bucket (call before switching buckets). */
  private accrue(now: number): void {
    if (!this.session?.active) return;
    this.session.split[this.bucket] += Math.max(0, now - this.lastAccrueTs);
    this.lastAccrueTs = now;
  }

  private rollUsageDay(): void {
    const today = todayKey();
    if (this.usageDay !== today) {
      this.usageDay = today;
      this.todayUsagePct = 0;
    }
  }

  /** Throttled (~1/s, trailing edge) unless `immediate`. */
  private notify(immediate = false): void {
    if (!this.onSnapshot) return;
    const now = Date.now();
    if (immediate || now - this.lastNotifyTs >= SNAPSHOT_MS) {
      if (this.notifyTimer) {
        clearTimeout(this.notifyTimer);
        this.notifyTimer = null;
      }
      this.lastNotifyTs = now;
      this.onSnapshot(this.snapshot());
    } else if (!this.notifyTimer) {
      this.notifyTimer = setTimeout(() => {
        this.notifyTimer = null;
        this.lastNotifyTs = Date.now();
        this.onSnapshot?.(this.snapshot());
      }, SNAPSHOT_MS - (now - this.lastNotifyTs));
    }
  }
}
