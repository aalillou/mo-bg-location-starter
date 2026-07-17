/**
 * First-run permission card — the only blocking step in the demo. Ring icon
 * built from bordered Views (no SVG dep). Copy verbatim from the mockup.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { strings } from '../strings';
import { colors, fonts, radii, shadows, sizes } from '../theme';

export function PermissionCard({ onGrant }: { onGrant: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <View style={styles.ring}>
          <View style={styles.core} />
        </View>
      </View>
      <Text style={styles.title}>{strings.permCard.title}</Text>
      <Text style={styles.body}>{strings.permCard.body}</Text>
      <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onGrant}>
        <Text style={styles.buttonText}>{strings.permCard.button}</Text>
      </Pressable>
      <Text style={styles.sub}>{strings.permCard.sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.permCard,
    paddingTop: 25, // 20
    paddingBottom: 20, // 16
    paddingHorizontal: 22, // 18
    alignItems: 'center',
    gap: 11, // 9
    ...shadows.permCard,
  },
  icon: {
    width: 52, // 42
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.permIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 22, // 18
    height: 22,
    borderWidth: 4, // 3
    borderColor: colors.blue,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 7, // 6
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.blue,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: sizes.permTitle,
    color: colors.ink,
    letterSpacing: -0.25, // -.2
  },
  body: {
    fontFamily: fonts.bold,
    fontSize: sizes.permBody,
    color: colors.tx2,
    lineHeight: sizes.permBody * 1.55,
    textAlign: 'center',
    maxWidth: 250, // 200
  },
  button: {
    alignSelf: 'stretch',
    backgroundColor: colors.blue,
    borderRadius: radii.button,
    paddingVertical: 14, // 11
    marginTop: 4, // 3
  },
  pressed: { opacity: 0.85 },
  buttonText: {
    fontFamily: fonts.extraBold,
    fontSize: sizes.permButton,
    color: '#ffffff',
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.bold,
    fontSize: sizes.permSub,
    color: colors.muted,
    lineHeight: sizes.permSub * 1.5,
    textAlign: 'center',
  },
});
