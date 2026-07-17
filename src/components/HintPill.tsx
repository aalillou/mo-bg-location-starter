/** Bottom hint pill — the swipe-away ritual (live) or "tap play" (idle). */
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, sizes } from '../theme';

export function HintPill({ text }: { text: string }) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.hint}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  hint: {
    fontFamily: fonts.bold,
    fontSize: sizes.hint,
    color: colors.muted,
    lineHeight: sizes.hint * 1.5,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: radii.hint,
    paddingHorizontal: 10, // 8
    paddingVertical: 3, // 2
    textAlign: 'center',
    overflow: 'hidden',
  },
});
