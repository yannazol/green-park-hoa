import { StyleSheet } from 'react-native';

import { BottomTabInset, radius, shadow, type AppColors } from '@/constants/theme';

export default function getAccountStyles(c: AppColors) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: BottomTabInset + 24,
      gap: 20,
    },
    profileHero: {
      alignItems: 'center',
      gap: 7,
    },
    pageEyebrow: {
      color: c.brand,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.4,
    },
    title: {
      color: c.text,
      fontSize: 25,
      fontWeight: '700',
    },
    avatarWrap: {
      width: 120,
      height: 120,
      marginTop: 10,
      marginBottom: 3,
      position: 'relative',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: c.bgCard,
      backgroundColor: c.bgMuted,
    },
    avatarFallback: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: c.bgCard,
      backgroundColor: c.brandLight,
    },
    cameraButton: {
      position: 'absolute',
      right: -2,
      bottom: 1,
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: c.bg,
      backgroundColor: c.brand,
    },
    profileName: {
      color: c.text,
      fontSize: 21,
      fontWeight: '700',
      textAlign: 'center',
    },
    profileType: {
      color: c.textSecondary,
      fontSize: 13,
      textTransform: 'capitalize',
      textAlign: 'center',
    },
    profileSection: {
      gap: 10,
    },
    sectionTitle: {
      color: c.text,
      fontSize: 16,
      fontWeight: '700',
    },
    infoCard: {
      paddingHorizontal: 15,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.borderLight,
      backgroundColor: c.bgCard,
      ...shadow.sm,
    },
    infoRow: {
      minHeight: 65,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: c.divider,
    },
    infoIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.brandLight,
    },
    infoText: {
      flex: 1,
      gap: 3,
    },
    label: {
      color: c.textSecondary,
      fontSize: 12,
    },
    value: {
      color: c.text,
      fontSize: 14,
      fontWeight: '600',
    },
    loadingCard: {
      minHeight: 100,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
    },
    emptyText: {
      color: c.textSecondary,
      fontSize: 14,
    },
    signOutSection: {
      paddingTop: 17,
      borderTopWidth: 1,
      borderTopColor: c.divider,
      gap: 12,
    },
    signOutCaption: {
      color: c.textSecondary,
      fontSize: 12,
      textAlign: 'center',
    },
    editPage: {
      flex: 1,
      backgroundColor: c.bg,
    },
    editScroll: {
      padding: 20,
      paddingBottom: 32,
      gap: 17,
    },
    editHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    headingText: {
      flex: 1,
      gap: 5,
    },
    subtitle: {
      color: c.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgMuted,
    },
    errorBox: {
      padding: 12,
      gap: 10,
      borderWidth: 1,
      borderRadius: radius.sm,
      borderColor: c.dangerBorder,
      backgroundColor: c.dangerBg,
    },
    errorText: {
      color: c.dangerText,
      fontSize: 14,
    },
  });
}
