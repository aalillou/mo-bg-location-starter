/**
 * Trip summary bottom sheet — every claim gets its number: distance/fixes,
 * duration/gaps, battery used, median accuracy, and the motion split
 * (zero entries kept, per mockup).
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatAcc,
  formatDistance,
  formatDurationMin,
  formatGaps,
  formatRange,
  formatSplit,
  formatUsedPct,
} from '../lib/format';
import { strings } from '../strings';
import { colors, fonts, radii, shadows, sizes } from '../theme';
import type { TripMetrics } from '../types';

export interface SummarySheetProps {
  metrics: TripMetrics;
  startedAt: number;
  endedAt: number;
  onDone: () => void;
}

function Tile({ label, value, sub, good }: { label: string; value: string; sub: string; good?: boolean }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, good && styles.tileGood]}>{value}</Text>
      <Text style={styles.tileSub}>{sub}</Text>
    </View>
  );
}

export function SummarySheet({ metrics, startedAt, endedAt, onDone }: SummarySheetProps) {
  const s = strings.summary;
  return (
    <View style={styles.sheet}>
      <View style={styles.grab} />
      <View style={styles.head}>
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.range}>{formatRange(startedAt, endedAt)}</Text>
      </View>
      <View style={styles.tiles}>
        <View style={styles.tileRow}>
          <Tile
            label={s.distanceLabel}
            value={formatDistance(metrics.distanceM)}
            sub={`${metrics.fixCount}${s.fixesSuffix}`}
          />
          <Tile
            label={s.durationLabel}
            value={formatDurationMin(metrics.durationMs)}
            sub={formatGaps(metrics.gapCount, metrics.gapMs)}
          />
        </View>
        <View style={styles.tileRow}>
          <Tile
            label={s.batteryLabel}
            value={metrics.batteryUsedPct != null ? formatUsedPct(metrics.batteryUsedPct) : '—'}
            sub={s.batterySub}
            good
          />
          <Tile
            label={s.accuracyLabel}
            value={metrics.medianAccM != null ? formatAcc(metrics.medianAccM) : '—'}
            sub={s.accuracySub}
          />
        </View>
      </View>
      <Text style={styles.split}>{formatSplit(metrics.split)}</Text>
      <Pressable style={({ pressed }) => [styles.done, pressed && styles.pressed]} onPress={onDone}>
        <Text style={styles.doneText}>{s.done}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.sheetTop,
    borderTopRightRadius: radii.sheetTop,
    paddingTop: 11, // 9
    paddingHorizontal: 20, // 16
    paddingBottom: 20, // 16
    gap: 14, // 11
    ...shadows.sheet,
  },
  grab: {
    width: 50, // 40
    height: 5, // 4
    borderRadius: 2.5,
    backgroundColor: colors.border3,
    alignSelf: 'center',
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: sizes.sheetTitle,
    color: colors.ink,
  },
  range: {
    fontFamily: fonts.mono,
    fontSize: sizes.sheetRange,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  tiles: { gap: 10 }, // 8
  tileRow: { flexDirection: 'row', gap: 10 }, // 8
  tile: {
    flex: 1,
    backgroundColor: colors.tint,
    borderRadius: radii.chip - 3, // 12
    paddingHorizontal: 14, // 11
    paddingVertical: 10, // 8
  },
  tileLabel: {
    fontFamily: fonts.bold,
    fontSize: sizes.tileLabel,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1, // .8
    marginBottom: 2.5, // 2
  },
  tileValue: {
    fontFamily: fonts.extraBold,
    fontSize: sizes.tileValue,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  tileGood: { color: colors.green },
  tileSub: {
    fontFamily: fonts.mono,
    fontSize: sizes.tileSub,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  split: {
    fontFamily: fonts.mono,
    fontSize: sizes.splitLine,
    color: colors.tx2,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  done: {
    backgroundColor: colors.card,
    borderWidth: 2, // 1.5
    borderColor: colors.border3,
    borderRadius: radii.button,
    paddingVertical: 12.5, // 10
  },
  pressed: { opacity: 0.7 },
  doneText: {
    fontFamily: fonts.extraBold,
    fontSize: sizes.permButton, // 13.5/800, same as btn-primary
    color: colors.ink,
    textAlign: 'center',
  },
});
