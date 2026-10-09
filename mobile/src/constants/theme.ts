/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

const lightColors = {
  bg: '#FAF7EF',
  bgSecondary: '#F3EDE0',
  bgCard: '#FFFFFF',
  bgElevated: '#FFFFFF',
  bgMuted: '#E8DCC6',
  bgAccent: '#EAF0EB',
  bgOverlay: 'rgba(30,42,68,0.45)',

  text: '#1E2A44',
  textSecondary: '#5B6478',
  textMuted: '#8A8FA0',
  textInverse: '#FFFFFF',

  border: '#DED4C1',
  borderLight: '#EDE6D6',
  borderStrong: '#B7A78F',
  divider: '#EDE6D6',

  primary: '#1E2A44',
  primaryHover: '#2A3A5C',
  onPrimary: '#FFFFFF',
  sidebar: '#1E2A44',

  brand: '#4E6B55',
  brandLight: '#EAF0EB',
  brandBorder: '#C5D4C8',

  danger: '#B4443C',
  dangerBg: '#FBEDEC',
  dangerBorder: '#E8B4B0',
  dangerText: '#9A332B',

  success: '#4E6B55',
  successBg: '#E8F0E9',
  successBorder: '#A9C2AE',
  successText: '#3B5742',

  warning: '#B7791F',
  warningBg: '#FBF1DC',
  warningBorder: '#E3C27A',
  warningText: '#8A5A12',

  info: '#3B5B8C',
  infoBg: '#E8EEF6',
  infoBorder: '#A9BDD9',
  infoText: '#2F4A73',

  shadow: '#1E2A44',
};

export type AppColors = typeof lightColors;

const darkColors: AppColors = {
  bg: '#121826',
  bgSecondary: '#182033',
  bgCard: '#1E2A44',
  bgElevated: '#243252',
  bgMuted: '#243252',
  bgAccent: '#1F3027',
  bgOverlay: 'rgba(0,0,0,0.65)',

  text: '#FAF7EF',
  textSecondary: '#C9C3B5',
  textMuted: '#8E93A3',
  textInverse: '#1E2A44',

  border: '#2E3B5A',
  borderLight: '#243252',
  borderStrong: '#4A5878',
  divider: '#2E3B5A',

  primary: '#E8DCC6',
  primaryHover: '#F1E8D6',
  onPrimary: '#1E2A44',
  sidebar: '#182033',

  brand: '#7FA188',
  brandLight: '#1F3027',
  brandBorder: '#3A5543',

  danger: '#E0736B',
  dangerBg: '#3A1F1F',
  dangerBorder: '#6B3030',
  dangerText: '#F0A09A',

  success: '#7FA188',
  successBg: '#1F3027',
  successBorder: '#3A5543',
  successText: '#A9C9B1',

  warning: '#E0B04F',
  warningBg: '#33281A',
  warningBorder: '#7A5A1E',
  warningText: '#F0CB80',

  info: '#7FA3D6',
  infoBg: '#1A2840',
  infoBorder: '#34507A',
  infoText: '#A9C3E8',

  shadow: '#000000',
};

export const radius = { sm: 8, md: 12, lg: 16 };
export const spacing = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32 };
export const shadow = {
  sm: {
    shadowColor: '#1E2A44',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
};

export { lightColors, darkColors };

export const Colors = {
  light: {
    text: lightColors.text,
    background: lightColors.bg,
    backgroundElement: lightColors.bgMuted,
    backgroundSelected: lightColors.border,
    textSecondary: lightColors.textSecondary,
  },
  dark: {
    text: darkColors.text,
    background: darkColors.bg,
    backgroundElement: darkColors.bgMuted,
    backgroundSelected: darkColors.border,
    textSecondary: darkColors.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
