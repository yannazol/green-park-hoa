import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getButtonStyles(c: AppColors) {
  return StyleSheet.create({
    base: {
      minHeight: 48,
      paddingHorizontal: 16,
      borderRadius: radius.md,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
    full: { alignSelf: 'stretch' },
    disabled: { opacity: 0.6 },
    text: { fontSize: 16, fontWeight: '600' },
    primaryText: { color: c.onPrimary },
    outlineText: { color: c.text },
  });
}
