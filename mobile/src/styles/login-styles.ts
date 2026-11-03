import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getLoginStyles(c: AppColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
      gap: 24,
    },
    brand: {
      alignItems: 'center',
      gap: 4,
    },
    brandName: {
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      color: c.text,
    },
    tagline: {
      fontSize: 14,
      color: c.textSecondary,
    },
    card: {
      padding: 20,
      gap: 16,
      borderWidth: 1,
      borderRadius: radius.lg,
      backgroundColor: c.bgCard,
      borderColor: c.border,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
    },
    cardSubtitle: {
      fontSize: 14,
      marginTop: -12,
      color: c.textSecondary,
    },
    errorBox: {
      padding: 12,
      borderWidth: 1,
      borderRadius: radius.sm,
      backgroundColor: c.dangerBg,
      borderColor: c.dangerBorder,
    },
    errorText: {
      fontSize: 14,
      color: c.dangerText,
    },
    passwordToggle: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}