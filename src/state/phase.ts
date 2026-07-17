/**
 * The 4-state machine (plus boot) — plain reducer, hosted in App.tsx.
 *
 *   boot → permission (perms missing) | live (session.active) | summary | idle
 *   permission --GRANTED--> live
 *   live --STOPPED--> summary
 *   summary --DISMISSED--> idle (ghost trail kept)
 *   idle --STARTED--> live
 *
 * Map + HUD scaffold render in every phase; the phase only selects which
 * instruments mount and which color arm the map takes.
 */
import type { AppPhase, ColorArm } from '../types';

export type PhaseAction =
  | { type: 'RESOLVED'; phase: AppPhase } // cold-start resolver outcome
  | { type: 'GRANTED' } // permission granted end-to-end → trip starts
  | { type: 'STARTED' } // play tapped in idle
  | { type: 'STOPPED' } // stop tapped in live
  | { type: 'DISMISSED' }; // Done tapped on the summary

export function phaseReducer(phase: AppPhase, action: PhaseAction): AppPhase {
  switch (action.type) {
    case 'RESOLVED':
      return phase === 'boot' ? action.phase : phase;
    case 'GRANTED':
      return phase === 'permission' ? 'live' : phase;
    case 'STARTED':
      return phase === 'idle' ? 'live' : phase;
    case 'STOPPED':
      return phase === 'live' ? 'summary' : phase;
    case 'DISMISSED':
      return phase === 'summary' ? 'idle' : phase;
    default:
      return phase;
  }
}

/** Which color arm the map/instruments take in each phase. */
export function colorArmFor(phase: AppPhase): ColorArm {
  switch (phase) {
    case 'live':
      return 'live';
    case 'summary':
      return 'ended';
    case 'idle':
      return 'off';
    default: // boot, permission — streets only, no trail yet
      return 'setup';
  }
}
