/**
 * Top-center headline pill: Mo mark + motion chip, with the mono position
 * line underneath while live/idle. Chip color arms per mockup: green while
 * tracking, grey when off/setup, ink+blue dot for TRIP ENDED, calm amber for
 * RESTING (isMoving===false) with a reassurance subline below the mono line.
 */
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows, sizes } from '../theme';

export type ChipTone = 'live' | 'off' | 'ink' | 'rest';

export interface HeadlinePillProps {
  label: string;
  tone: ChipTone;
  /** Bold mono coords ("50.8467, 4.3525"); line hidden when absent. */
  coords?: string;
  /** Regular tail after the coords (" · ±8 m · 2 s" / " · 5 min ago"). */
  monoTail?: string;
  /** Muted mono line (idle). */
  monoMuted?: boolean;
  /** Amber reassurance subline under the mono line (RESTING). */
  note?: string;
}

const TONE_TEXT: Record<ChipTone, string> = {
  live: colors.greenText,
  off: colors.muted,
  ink: colors.ink,
  rest: colors.amberText,
};
const TONE_DOT: Record<ChipTone, string> = {
  live: colors.green,
  off: colors.greyOff,
  ink: colors.blue,
  rest: colors.amber,
};

export function HeadlinePill({ label, tone, coords, monoTail, monoMuted, note }: HeadlinePillProps) {
  return (
    <View style={styles.pill}>
      <View style={styles.headRow}>
        <Image source={require('../../assets/mo-mark.png')} style={styles.mark} />
        <View style={styles.chip}>
          <View style={[styles.dot, { backgroundColor: TONE_DOT[tone] }]} />
          <Text style={[styles.chipText, { color: TONE_TEXT[tone] }]}>{label}</Text>
        </View>
      </View>
      {coords != null && (
        <Text style={[styles.mono, monoMuted && styles.monoMuted]}>
          <Text style={[styles.monoBold, monoMuted && styles.monoMuted]}>{coords}</Text>
          {monoTail}
        </Text>
      )}
      {note != null && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    gap: 6, // 5
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingTop: 12, // 10
    paddingBottom: 11, // 9
    paddingHorizontal: 22, // 18
    ...shadows.chip,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11, // 9
  },
  mark: {
    width: sizes.markLogo,
    height: sizes.markLogo,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9, // 7
  },
  dot: {
    width: sizes.motionDot,
    height: sizes.motionDot,
    borderRadius: sizes.motionDot / 2,
  },
  chipText: {
    fontFamily: fonts.extraBold,
    fontSize: sizes.motionChip,
    letterSpacing: 0.5, // .4
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: sizes.monoLine,
    color: colors.tx2,
    fontVariant: ['tabular-nums'],
  },
  monoBold: {
    fontFamily: fonts.monoBold,
    color: colors.ink,
  },
  monoMuted: {
    color: colors.muted,
  },
  note: {
    fontFamily: fonts.bold,
    fontSize: sizes.miniChip,
    color: colors.amberText,
    letterSpacing: 0.2,
  },
});
