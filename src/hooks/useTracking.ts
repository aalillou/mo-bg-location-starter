/**
 * SDK lifecycle + the cold-start resolver — the core of the swipe-away demo.
 *
 * Every boot: configure → attach onLocation/onMotionChange (feeding the
 * recorder; ignored without an active session) → resolve the phase from
 * real grants + persisted session. A restored live session calls `start()`
 * (idempotent — a no-op when wakeOnTerminate revival is already tracking);
 * kill-window fixes aren't JS-delivered, so the trail resumes as a new
 * segment and the gap tracker reports the hole honestly.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { configure, getPermissions, onLocation, onMotionChange, start, stop } from '@aalillou/mo-bg-location';
import { SDK_CONFIG } from '../sdkConfig';
import { loadState } from '../state/persistence';
import { TripRecorder, type RecorderSnapshot } from '../state/tripRecorder';
import { readBatteryLevel } from './useBattery';
import type { AppPhase } from '../types';

export interface Tracking extends RecorderSnapshot {
  /** Start a fresh trip (battery baseline + SDK start). */
  startTrip: () => Promise<void>;
  /** Stop the SDK and close the session (battery delta + today accumulator). */
  stopTrip: () => Promise<void>;
  /** Summary Done — keeps the ghost trail. */
  dismissSummary: () => void;
}

export function useTracking(onResolved: (phase: AppPhase) => void): Tracking {
  const recorderRef = useRef<TripRecorder | null>(null);
  if (!recorderRef.current) recorderRef.current = new TripRecorder();
  const recorder = recorderRef.current;

  const [snap, setSnap] = useState<RecorderSnapshot>(() => recorder.snapshot());
  const resolvedRef = useRef(false);

  useEffect(() => {
    recorder.onSnapshot = setSnap;
    const subLoc = onLocation((e) => recorder.onFix(e));
    const subMot = onMotionChange((e) => recorder.onMotion(e));
    const subApp = AppState.addEventListener('change', (s) => {
      if (s !== 'active') recorder.persistNow();
    });

    (async () => {
      await configure(SDK_CONFIG);
      const state = loadState();
      recorder.adopt(state);
      setSnap(recorder.snapshot());

      if (resolvedRef.current) return; // effect re-ran (fast refresh)
      resolvedRef.current = true;

      const perms = await getPermissions();
      let phase: AppPhase;
      if (!perms.foreground || !perms.background) {
        phase = 'permission';
      } else if (state.session?.active) {
        phase = 'live';
        await start(); // idempotent — revival may already be tracking
      } else if (state.session && !state.session.dismissed) {
        phase = 'summary';
      } else {
        phase = 'idle';
      }
      onResolved(phase);
    })();

    return () => {
      recorder.onSnapshot = null;
      subLoc.remove();
      subMot.remove();
      subApp.remove();
    };
    // mount-only: the SDK subscription set never changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTrip = useCallback(async () => {
    recorder.startTrip(await readBatteryLevel());
    await start();
  }, [recorder]);

  const stopTrip = useCallback(async () => {
    await stop();
    recorder.stopTrip(await readBatteryLevel());
  }, [recorder]);

  const dismissSummary = useCallback(() => {
    recorder.dismiss();
  }, [recorder]);

  return { ...snap, startTrip, stopTrip, dismissSummary };
}
