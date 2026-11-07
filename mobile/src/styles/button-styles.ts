import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getButtonStyles(c: AppColors) {
  return StyleSheet.create({
    base: {
      minHeight: 48,
      paddingHorizontal: 16,
      borderRadius: radius.md,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    primary: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    primaryPressed: {
      backgroundColor: c.primaryHover,
      borderColor: c.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: c.borderStrong,
    },
    outlinePressed: {
      backgroundColor: c.bgMuted,
      borderColor: c.borderStrong,
    },
    brandOutline: {
      backgroundColor: 'transparent',
      borderColor: c.brand,
      borderRadius: 999,
    },
    brandOutlinePressed: {
      backgroundColor: c.brandLight,
      borderColor: c.brand,
      borderRadius: 999,
    },
    ghost: {
      borderWidth: 0,
      backgroundColor: 'transparent',
    },
    ghostPressed: {
      borderWidth: 0,
      backgroundColor: c.bgSecondary,
    },
    full: { alignSelf: 'stretch' },
    disabled: { opacity: 0.6 },
    text: { fontSize: 16, fontWeight: '600' },
    primaryText: { color: c.onPrimary },
    outlineText: { color: c.text },
    brandOutlineText: { color: c.brand },
    ghostText: { color: c.text },
  });
}
