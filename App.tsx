/**
 * M1/M2 PROBE — throwaway smoke-test shell, replaced by the real HUD in S2.
 * Proves on-device: SDK configure/permissions/start/stop, fixes arriving,
 * MapLibre Positron tiles, live trail + crumbs + pulsing position marker.
 */
import { useEffect, useRef, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import {
  configure,
  getPermissions,
  onLocation,
  onMotionChange,
  requestPermissions,
  start,
  stop,
  type LocationEvent,
  type MotionEvent,
} from '@aalillou/mo-bg-location';
import { SDK_CONFIG } from './src/sdkConfig';
import { appendFix } from './src/lib/geo';
import { TrailMap } from './src/components/TrailMap';
import type { TrailSegments, TripFix } from './src/types';

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  const [log, setLog] = useState<string[]>([]);
  const [perms, setPerms] = useState<string>('?');
  const [segments, setSegments] = useState<TrailSegments>([]);
  const [lastFix, setLastFix] = useState<TripFix | undefined>();
  const segmentsRef = useRef<TrailSegments>([]);
  const lines = useRef<string[]>([]);

  const push = (s: string) => {
    lines.current = [`${new Date().toISOString().slice(11, 19)} ${s}`, ...lines.current].slice(0, 20);
    setLog(lines.current);
  };

  useEffect(() => {
    const subLoc = onLocation((e: LocationEvent) => {
      const fix: TripFix = { lat: e.latitude, lng: e.longitude, acc: e.accuracy, ts: e.timestamp };
      appendFix(segmentsRef.current, fix);
      setSegments([...segmentsRef.current]); // new outer identity → re-render
      setLastFix(fix);
      push(`fix ${e.latitude.toFixed(5)},${e.longitude.toFixed(5)} ±${Math.round(e.accuracy)}m ${e.activity}`);
    });
    const subMot = onMotionChange((e: MotionEvent) => {
      push(`motion ${e.activity} moving=${e.isMoving}`);
    });
    (async () => {
      await configure(SDK_CONFIG);
      push('configured');
      const p = await getPermissions();
      setPerms(JSON.stringify(p));
    })();
    return () => {
      subLoc.remove();
      subMot.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={styles.mapBox}>
          <TrailMap segments={segments} lastFix={lastFix} arm="live" camera="follow" />
        </View>
        <View style={styles.panel}>
          <Text style={styles.perms} numberOfLines={2}>
            perms: {perms}
          </Text>
          <View style={styles.row}>
            <Button
              title="Request"
              onPress={async () => {
                // The documented one-shot ladder. On iOS this needs SDK ≥ 0.1.3
                // (0.1.2's combined form skips the location stages — fixed there).
                try {
                  const p = await requestPermissions({ background: true, activity: true });
                  setPerms(JSON.stringify(p));
                } catch (e) {
                  push(`request ERR ${String(e)}`);
                }
              }}
            />
            <Button
              title="Start"
              onPress={async () => {
                try {
                  await start();
                  push('started');
                } catch (e) {
                  push(`start ERR ${String(e)}`);
                }
              }}
            />
            <Button
              title="Stop"
              onPress={async () => {
                try {
                  await stop();
                  push('stopped');
                } catch (e) {
                  push(`stop ERR ${String(e)}`);
                }
              }}
            />
          </View>
          <ScrollView style={styles.log}>
            {log.map((l, i) => (
              <Text key={i} style={styles.line}>{l}</Text>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  mapBox: { flex: 1 },
  panel: { height: 260, backgroundColor: '#fff', padding: 12, paddingBottom: 24 },
  perms: { fontSize: 11, color: '#4a5866' },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 6 },
  log: { flex: 1 },
  line: { fontSize: 11, fontFamily: 'monospace', color: '#1d2733' },
});
