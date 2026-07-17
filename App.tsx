/**
 * bg·location starter — font loading, phase-machine host, composition.
 * Map + HUD scaffold render in every phase; the phase only selects which
 * instruments mount and which color arm the map takes.
 */
import { useEffect, useMemo, useReducer, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';

import { Fab } from './src/components/Fab';
import { HeadlinePill, type ChipTone } from './src/components/HeadlinePill';
import { HintPill } from './src/components/HintPill';
import { MiniChip } from './src/components/MiniChip';
import { PermissionCard } from './src/components/PermissionCard';
import { SideChip } from './src/components/SideChips';
import { StatusLozenge } from './src/components/StatusLozenge';
import { SummarySheet } from './src/components/SummarySheet';
import { TrailMap } from './src/components/TrailMap';
import { useBattery } from './src/hooks/useBattery';
import { usePermissionFlow } from './src/hooks/usePermissionFlow';
import { useTracking } from './src/hooks/useTracking';
import { formatAcc, formatAge, formatAgeAgo, formatCoords, formatLevelPct, formatUsedPct } from './src/lib/format';
import { computeMetrics } from './src/lib/metrics';
import { colorArmFor, phaseReducer } from './src/state/phase';
import { strings } from './src/strings';
import type { MotionBucket } from './src/types';

const MOTION_LABEL: Record<MotionBucket, string> = {
  driving: strings.motion.driving,
  walking: strings.motion.walking,
  still: strings.motion.still,
};

/** Re-render tick for the fix-age readouts (1 s granularity). */
function useNow(enabled: boolean): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [enabled]);
  return now;
}

function Main() {
  const insets = useSafeAreaInsets();
  const [phase, dispatch] = useReducer(phaseReducer, 'boot');
  const tracking = useTracking((p) => dispatch({ type: 'RESOLVED', phase: p }));
  const flow = usePermissionFlow();
  const batteryLevel = useBattery();

  const { session, segments, lastFix, bucket, todayUsagePct } = tracking;
  const now = useNow(phase === 'live' || (phase === 'idle' && !!lastFix));

  // permission phase: a completed grant (button or Settings round-trip)
  // auto-starts the trip — "foreground+background ⇒ auto-start → live"
  useEffect(() => {
    if (phase !== 'permission' || !flow.granted) return;
    let cancelled = false;
    (async () => {
      await tracking.startTrip();
      if (!cancelled) dispatch({ type: 'GRANTED' });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, flow.granted]);

  const handlePlay = async () => {
    // perms can be revoked between trips — re-run the ladder if needed
    const p = flow.granted ? null : await flow.request();
    if (p && !(p.foreground && p.background)) return;
    await tracking.startTrip();
    dispatch({ type: 'STARTED' });
  };

  const handleStop = async () => {
    await tracking.stopTrip();
    dispatch({ type: 'STOPPED' });
  };

  const handleDone = () => {
    tracking.dismissSummary();
    dispatch({ type: 'DISMISSED' });
  };

  // ----- derived HUD state -----

  const arm = colorArmFor(phase);
  const camera = phase === 'summary' || (phase === 'idle' && segments.length > 0) ? 'fit' : 'follow';

  let chipLabel: string;
  let chipTone: ChipTone;
  switch (phase) {
    case 'live':
      chipLabel = MOTION_LABEL[bucket];
      chipTone = 'live';
      break;
    case 'summary':
      chipLabel = strings.motion.ended;
      chipTone = 'ink';
      break;
    case 'idle':
      chipLabel = strings.motion.off;
      chipTone = 'off';
      break;
    default: // boot, permission
      chipLabel = strings.motion.setup;
      chipTone = 'off';
  }

  let coords: string | undefined;
  let monoTail: string | undefined;
  if (phase === 'live' && lastFix) {
    coords = formatCoords(lastFix.lat, lastFix.lng);
    monoTail = ` · ${formatAcc(lastFix.acc)} · ${formatAge(now - lastFix.ts)}`;
  } else if (phase === 'idle' && lastFix) {
    coords = formatCoords(lastFix.lat, lastFix.lng);
    monoTail = ` · ${formatAgeAgo(now - lastFix.ts)}`;
  }

  const perms = flow.perms;
  const miniChip =
    phase === 'summary' || !perms
      ? null
      : !perms.foreground || !perms.background
        ? { ok: false, label: strings.perms.missing }
        : !perms.precise
          ? { ok: false, label: strings.perms.imprecise, onPress: () => Linking.openSettings() }
          : { ok: true, label: strings.perms.granted };

  let batteryValue: string | null = null;
  if (batteryLevel != null) {
    if (phase === 'live') {
      const used = session?.batteryStart != null ? Math.max(0, (session.batteryStart - batteryLevel) * 100) : null;
      batteryValue = used != null ? `${formatLevelPct(batteryLevel)} · ${formatUsedPct(used)}` : formatLevelPct(batteryLevel);
    } else if (phase === 'idle') {
      batteryValue = `${formatLevelPct(batteryLevel)} · ${strings.chips.todayPrefix}${formatUsedPct(todayUsagePct)}`;
    }
  }

  const metrics = useMemo(
    () => (phase === 'summary' && session && !session.active ? computeMetrics(session) : null),
    [phase, session],
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <TrailMap
        segments={segments}
        lastFix={lastFix}
        arm={arm}
        camera={camera}
        fitBottomPadding={phase === 'summary' ? 340 : 0}
      />

      {/* top: headline pill + permission mini-chip */}
      <View style={[styles.hudTop, { top: insets.top + 24 }]} pointerEvents="box-none">
        <HeadlinePill label={chipLabel} tone={chipTone} coords={coords} monoTail={monoTail} monoMuted={phase === 'idle'} />
        {miniChip && <MiniChip ok={miniChip.ok} label={miniChip.label} onPress={miniChip.onPress} />}
      </View>

      {/* right: instrument chips */}
      {(phase === 'live' || (phase === 'idle' && batteryValue != null)) && (
        <View style={[styles.hudSide, { top: insets.top + 176 }]} pointerEvents="box-none">
          {batteryValue != null && <SideChip label={strings.chips.batteryLabel} value={batteryValue} good />}
          {phase === 'live' && <SideChip label={strings.chips.killedLabel} value={strings.chips.killedValue} />}
        </View>
      )}

      {/* first run: the one blocking step */}
      {phase === 'permission' && (
        <View style={[styles.permWrap, { top: insets.top + 186 }]} pointerEvents="box-none">
          <PermissionCard onGrant={() => void flow.request()} />
        </View>
      )}

      {/* bottom: status lozenge + FAB, hint pill */}
      {(phase === 'live' || phase === 'idle') && (
        <>
          <View style={[styles.hudBottom, { bottom: insets.bottom + 78 }]} pointerEvents="box-none">
            <StatusLozenge
              live={phase === 'live'}
              badge={phase === 'live' ? strings.status.liveBadge : strings.status.offBadge}
              label={phase === 'live' ? strings.status.trackingOn : strings.status.trackingOff}
            />
            <Fab mode={phase === 'live' ? 'stop' : 'play'} onPress={phase === 'live' ? handleStop : handlePlay} />
          </View>
          <View style={[styles.hudHint, { bottom: insets.bottom + 18 }]} pointerEvents="none">
            <HintPill text={phase === 'live' ? strings.hints.live : strings.hints.idle} />
          </View>
        </>
      )}

      {/* trip summary sheet */}
      {phase === 'summary' && metrics && session && (
        <View style={[styles.sheetWrap, { paddingBottom: insets.bottom }]} pointerEvents="box-none">
          <SummarySheet
            metrics={metrics}
            startedAt={session.startedAt}
            endedAt={session.endedAt ?? Date.now()}
            onDone={handleDone}
          />
        </View>
      )}
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f3f6f9' }, // map bg while tiles load
  hudTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 10, // 8
  },
  hudSide: {
    position: 'absolute',
    right: 12, // 10
    alignItems: 'flex-end',
    gap: 10, // 8
  },
  permWrap: {
    position: 'absolute',
    left: 30, // 24
    right: 30,
  },
  hudBottom: {
    position: 'absolute',
    left: 15, // 12
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12, // 10
  },
  hudHint: {
    position: 'absolute',
    left: 25, // 20
    right: 25,
  },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff', // sheet color continues under the home indicator
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});
