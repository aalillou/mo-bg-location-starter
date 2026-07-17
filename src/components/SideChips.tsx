/**
 * Right-hand instrument chips: Battery ("87% · −0.4%" live, "87% · today
 * −0.6%" idle) and — live only — the "App killed? Still tracking" chip.
 */
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows, sizes } from '../theme';

export interface SideChipProps {
  label: string;
  value: string;
  good?: boolean;
}

export function SideChip({ label, value, good }: SideChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, good && styles.good]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.card,
    borderRadius: radii.chip,
    paddingHorizontal: 14, // 11
    paddingVertical: 9, // 7
    alignItems: 'flex-start',
    ...shadows.chip,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: sizes.chipLabel,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1, // .8
  },
  value: {
    fontFamily: fonts.extraBold,
    fontSize: sizes.chipValue,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  good: { color: colors.green },
});
