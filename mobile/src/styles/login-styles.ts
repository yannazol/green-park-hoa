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
      paddingHorizontal: 22,
      paddingVertical: 28,
      gap: 22,
    },
    brand: {
      alignItems: 'center',
      gap: 7,
    },
    brandLogo: {
      width: 120,
      height: 120,
      marginBottom: 5,
    },
    brandName: {
      fontSize: 23,
      fontWeight: '700',
      textAlign: 'center',
      color: c.text,
      letterSpacing: 0.1,
    },
    tagline: {
      fontSize: 14,
      color: c.textSecondary,
    },
    card: {
      padding: 22,
      gap: 18,
      borderWidth: 1,
      borderRadius: 22,
      backgroundColor: c.bgCard,
      borderColor: c.border,
      shadowColor: c.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 7 },
      elevation: 3,
    },
    cardTitle: {
      fontSize: 21,
      fontWeight: '700',
      color: c.text,
    },
    cardSubtitle: {
      fontSize: 14,
      marginTop: -12,
      lineHeight: 20,
      color: c.textSecondary,
    },
    authInput: {
      minHeight: 54,
      borderRadius: 15,
      borderColor: c.border,
      paddingHorizontal: 16,
    },
    authInputWithAdornment: {
      minHeight: 54,
      borderRadius: 15,
      borderColor: c.border,
      paddingLeft: 16,
      paddingRight: 60,
    },
    primaryButton: {
      minHeight: 54,
      borderRadius: 15,
      backgroundColor: c.brand,
      borderColor: c.brand,
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
    successBox: {
      padding: 12,
      borderWidth: 1,
      borderRadius: radius.sm,
      backgroundColor: c.successBg,
      borderColor: c.successBorder,
    },
    successText: {
      fontSize: 14,
      color: c.successText,
    },
    setupLink: {
      alignSelf: 'center',
      paddingHorizontal: 8,
      paddingVertical: 9,
    },
    setupLinkText: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      color: c.brand,
      lineHeight: 20,
    },
    passwordToggle: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 22,
    },
  });
}