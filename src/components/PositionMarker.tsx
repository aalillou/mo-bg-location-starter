/**
 * The position dot + pulsing halo (mockup: dot r7 white-stroke 3; halo
 * opacity .2, scale .45→1.7 fade over 2 s). Blue while live, red as the
 * trip-summary arrival marker, grey (pulse hidden) when off. `paused` keeps
 * the color but stills the pulse (RESTING — trip paused, not off).
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import type { ColorArm } from '../types';

const DOT = 18; // mockup r7 ⇒ 14px ×1.25
const BORDER = 4; // mockup 3
const HALO = 44;

const ARM_COLOR: Record<ColorArm, string> = {
  live: colors.blue,
  ended: colors.red,
  off: colors.greyOff,
  setup: colors.greyOff,
};

export function PositionMarker({ arm, paused = false }: { arm: ColorArm; paused?: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const pulsing = (arm === 'live' || arm === 'ended') && !paused;

  useEffect(() => {
    if (!pulsing) return;
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, pulsing]);

  const color = ARM_COLOR[arm];

  return (
    <View style={styles.box} pointerEvents="none">
      {pulsing && (
        <Animated.View
          style={[
            styles.halo,
            {
              backgroundColor: color,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1.7] }) }],
            },
          ]}
        />
      )}
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: HALO, height: HALO, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: BORDER,
    borderColor: '#ffffff',
  },
});
