/**
 * The one action button: red rounded square = stop (live), green play
 * triangle = start (idle). Triangle drawn with the border trick — no SVG dep.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, shadows, sizes } from '../theme';

export function Fab({ mode, onPress }: { mode: 'stop' | 'play'; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={mode === 'stop' ? 'Stop tracking' : 'Start tracking'}
    >
      {mode === 'stop' ? <View style={styles.square} /> : <View style={styles.tri} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: sizes.fab,
    height: sizes.fab,
    borderRadius: sizes.fab / 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  pressed: { opacity: 0.7 },
  square: {
    width: 18, // 14
    height: 18,
    borderRadius: 4.5, // 3.5
    backgroundColor: colors.red,
  },
  tri: {
    width: 0,
    height: 0,
    borderLeftWidth: 19, // 15
    borderLeftColor: colors.green,
    borderTopWidth: 12, // 9.5
    borderTopColor: 'transparent',
    borderBottomWidth: 12,
    borderBottomColor: 'transparent',
    marginLeft: 5, // 4 — optical centering
  },
});
