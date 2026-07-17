/**
 * Bottom-left status lozenge: LIVE (pinging green dot) + "Tracking on", or
 * OFF (static grey dot) + "Not tracking".
 */
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows, sizes } from '../theme';

export function StatusLozenge({ live, badge, label }: { live: boolean; badge: string; label: string }) {
  const ping = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!live) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ping, { toValue: 0.35, duration: 750, useNativeDriver: true }),
        Animated.timing(ping, { toValue: 1, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [live, ping]);

  return (
    <View style={styles.lozenge}>
      <View style={[styles.badge, live ? styles.badgeLive : styles.badgeOff]}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: live ? colors.green : colors.greyOff, opacity: live ? ping : 1 },
          ]}
        />
        <Text style={[styles.badgeText, { color: live ? colors.greenText : colors.muted }]}>{badge}</Text>
      </View>
      <Text style={[styles.track, !live && styles.trackOff]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lozenge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // 8
    backgroundColor: colors.card,
    borderRadius: radii.chip,
    paddingHorizontal: 14, // 11
    paddingVertical: 9, // 7
    ...shadows.chip,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // 5
    borderRadius: radii.badge,
    paddingHorizontal: 12, // 10
    paddingVertical: 5, // 4
  },
  badgeLive: { backgroundColor: colors.greenBadgeBg },
  badgeOff: { backgroundColor: colors.offBadgeBg },
  dot: {
    width: 8, // 6
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: fonts.extraBold,
    fontSize: sizes.badge,
  },
  track: {
    fontFamily: fonts.extraBold,
    fontSize: sizes.lozengeText,
    color: colors.ink,
  },
  trackOff: { color: colors.muted },
});
