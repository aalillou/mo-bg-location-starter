/**
 * Design tokens transcribed from the approved mockups
 * (mo-bg-website/docs/design/0004-starter-app-mockups.html, round 3).
 * Mockup canvas is a 300×600 phone; sizes here are pre-scaled ×1.25 for real
 * devices — original mockup values in comments. App UI is constant light, by design.
 */
import { Platform, type ViewStyle } from 'react-native';

export const colors = {
  // brand (constant across themes)
  blue: '#29abe2',
  red: '#e8384f',
  green: '#35c46a',
  amber: '#f5b83d',
  ink: '#1d2733',
  // light chrome
  pageBg: '#fdfdfe',
  card: '#ffffff',
  tint: '#f4f8fb',
  tx2: '#4a5866',
  muted: '#7a8794',
  border: '#e3ecf2',
  borderSoft: '#e8eff5',
  border3: '#dbe5ec', // grab handle / ghost button border
  // state accents
  greyOff: '#c3ced8', // off dots, ghost trail
  offBadgeBg: '#f0f5f9',
  greenText: '#2aa35a', // green on light backgrounds
  greenBadgeBg: '#e9f9f0',
  permIconBg: '#eef7fc',
  // map artwork
  routeCasing: '#c9e9f9',
  ghostCasing: '#e2e8ee',
} as const;

export const radii = {
  pill: 20, // 16
  chip: 15, // 12
  button: 18, // 14
  permCard: 22, // 18
  sheetTop: 30, // 24
  badge: 12, // 10
  hint: 10, // 8
  osm: 8, // 6
} as const;

export const fonts = {
  // loaded in App.tsx via @expo-google-fonts
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const sizes = {
  motionChip: 18, // 14 / 800
  motionDot: 10, // 8
  monoLine: 14, // 11
  miniChip: 13, // 10.5 / 700
  chipLabel: 11, // 9 / 700 uppercase ls .8
  chipValue: 16, // 12.5 / 800
  badge: 14, // 11 / 800
  lozengeText: 14, // 11 / 800
  hint: 13, // 10.5
  fab: 58, // 46
  permTitle: 19, // 15 / 800
  permBody: 14.5, // 11.5 lh 1.55
  permButton: 17, // 13.5 / 800
  permSub: 12, // 9.5
  sheetTitle: 19, // 15 / 800
  sheetRange: 12.5, // 10 mono
  tileLabel: 11, // 9 / 700
  tileValue: 17, // 13.5 / 800
  tileSub: 12, // 9.5 mono
  splitLine: 12.5, // 10 mono
  osm: 10, // 8 mono
  markLogo: 21, // 17
} as const;

/** CSS box-shadows from the mockup mapped to RN (iOS shadow + Android elevation). */
function shadow(offsetY: number, blur: number, opacity: number, elevation: number): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.ink,
      shadowOffset: { width: 0, height: offsetY },
      shadowRadius: blur / 2,
      shadowOpacity: opacity,
    },
    default: { elevation },
  })!;
}

export const shadows = {
  chip: shadow(8, 20, 0.1, 6), // 0 8px 20px rgba(ink,.10)
  fab: shadow(8, 20, 0.16, 8), // 0 8px 20px rgba(ink,.16)
  permCard: shadow(12, 30, 0.14, 10), // 0 12px 30px rgba(ink,.14)
  sheet: shadow(-10, 26, 0.1, 14), // 0 -10px 26px rgba(ink,.10)
  miniChip: shadow(4, 12, 0.08, 4), // 0 4px 12px rgba(ink,.08)
} as const;
