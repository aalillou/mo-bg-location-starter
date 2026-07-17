/**
 * Permission mini-chip under the headline pill: "✓ Always allowed" /
 * "✕ Location not granted" / "✕ Precise location off" (approved delta —
 * tappable → Settings).
 */
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, shadows, sizes } from '../theme';

export interface MiniChipProps {
  ok: boolean;
  label: string;
  onPress?: () => void;
}

export function MiniChip({ ok, label, onPress }: MiniChipProps) {
  return (
    <Pressable style={styles.chip} onPress={onPress} disabled={!onPress}>
      <Text style={[styles.sign, ok ? styles.ok : styles.no]}>{ok ? '✓' : '✕'}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // 5
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radii.chip - 4, // 9
    paddingHorizontal: 11, // 9
    paddingVertical: 5, // 4
    ...shadows.miniChip,
  },
  sign: {
    fontFamily: fonts.extraBold,
    fontSize: sizes.miniChip,
  },
  ok: { color: colors.green },
  no: { color: colors.red },
  label: {
    fontFamily: fonts.bold,
    fontSize: sizes.miniChip,
    color: colors.tx2,
  },
});
