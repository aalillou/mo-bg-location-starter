/**
 * ALL user-facing copy, transcribed verbatim from the approved mockups
 * (mo-bg-website/docs/design/0004-starter-app-mockups.html, round 3), except
 * the RESTING chip copy which is a session-12 locked decision (see motion.*).
 * Single source — components never hardcode copy.
 */

export const strings = {
  /** Headline motion-chip labels, per phase / motion bucket. */
  motion: {
    /** Live chip while `isMoving`: the motion bucket phrased for a person. */
    inVehicle: 'IN VEHICLE',
    onFoot: 'ON FOOT',
    /**
     * Live chip while `isMoving === false`. Session-12 addition — NOT in the
     * round-3 mockup: iOS latches the last travel label (never emits `still`),
     * so a raw STILL/WALKING chip lied. RESTING + the reassurance subline is
     * honest on both platforms and demos the battery-saving core.
     * See docs/sessions/0011-pickup.md finding #1.
     */
    resting: 'RESTING',
    restingSub: 'saving battery · wakes when you move',
    setup: 'SET UP',
    off: 'TRACKING OFF',
    ended: 'TRIP ENDED',
  },

  /** Permission mini-chip under the headline pill. */
  perms: {
    granted: 'Always allowed',
    missing: 'Location not granted',
    /** Approved design delta: shown when precise === false; tap → Settings. */
    imprecise: 'Precise location off',
  },

  /** Right-hand side chips. */
  chips: {
    batteryLabel: 'Battery',
    killedLabel: 'App killed?',
    killedValue: 'Still tracking',
    /** Idle battery sub-value prefix: "today −0.6%". */
    todayPrefix: 'today ',
  },

  /** Bottom-left status lozenge. */
  status: {
    liveBadge: 'LIVE',
    offBadge: 'OFF',
    trackingOn: 'Tracking on',
    trackingOff: 'Not tracking',
  },

  /** Bottom hint pill. */
  hints: {
    live: 'Swipe the app away, then reopen — the trail keeps growing.',
    idle: 'Tap play to start tracking.',
  },

  /** First-run permission card. */
  permCard: {
    title: 'Allow location — Always',
    body:
      'The demo tracks in the background to draw your trail. Everything stays on ' +
      'this phone — no backend, no telemetry.',
    button: 'Grant permission',
    sub: 'The system asks in two steps: While Using, then Always.',
  },

  /** Trip summary sheet. */
  summary: {
    title: 'Trip summary',
    distanceLabel: 'Distance',
    fixesSuffix: ' fixes',
    durationLabel: 'Duration',
    noGaps: 'no gaps',
    batteryLabel: 'Battery used',
    batterySub: 'screen mostly off',
    accuracyLabel: 'Accuracy',
    accuracySub: 'median',
    done: 'Done',
  },

  /** Map attribution chip (we disable the native ornament, render our own). */
  osmAttribution: '© OpenStreetMap',
} as const;
