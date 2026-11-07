import { StyleSheet } from 'react-native';

import { BottomTabInset, radius, type AppColors } from '@/constants/theme';

export default function getAccountStyles(c: AppColors) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      paddingBottom: BottomTabInset + 24,
      gap: 0,
    },
    profileHeader: {
      minHeight: 210,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
      gap: 7,
      backgroundColor: c.brand,
      borderBottomLeftRadius: 88,
      borderBottomRightRadius: 88,
    },
    profileHero: {
      alignItems: 'center',
      gap: 7,
    },
    pageEyebrow: {
      color: c.textInverse,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.4,
    },
    title: {
      color: c.textInverse,
      fontSize: 25,
      fontWeight: '700',
    },
    profileCard: {
      marginTop: -106,
      paddingHorizontal: 20,
      paddingTop: 0,
      paddingBottom: 24,
      gap: 18,
    },
    avatarWrap: {
      width: 132,
      height: 132,
      marginTop: 0,
      marginBottom: 2,
      position: 'relative',
    },
    avatar: {
      width: 132,
      height: 132,
      borderRadius: 66,
      borderWidth: 3,
      borderColor: c.bgCard,
      backgroundColor: c.bgMuted,
    },
    avatarFallback: {
      width: 132,
      height: 132,
      borderRadius: 66,
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
      gap: 8,
    },
    vehiclesSection: {
      gap: 8,
    },
    vehicleList: {
      gap: 2,
    },
    vehicleRow: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    vehicleIcon: {
      width: 32,
      alignItems: 'center',
    },
    vehicleDetails: {
      flex: 1,
      gap: 3,
    },
    vehiclePlate: {
      color: c.text,
      fontSize: 14,
      fontWeight: '700',
    },
    vehicleDescription: {
      color: c.textSecondary,
      fontSize: 12,
    },
    vehicleStatus: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: radius.md,
      backgroundColor: c.brandLight,
    },
    vehicleStatusText: {
      color: c.brand,
      fontSize: 11,
      fontWeight: '600',
    },
    noVehicles: {
      paddingVertical: 10,
      color: c.textSecondary,
      fontSize: 13,
    },
    sectionTitle: {
      color: c.text,
      fontSize: 16,
      fontWeight: '700',
    },
    infoCard: {
      gap: 2,
    },
    infoRow: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    infoIcon: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
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
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.divider,
    },
    signOutButton: {
      minHeight: 54,
      paddingHorizontal: 24,
    },
    editPage: {
      flex: 1,
      backgroundColor: c.bg,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      overflow: 'hidden',
    },
    editFlex: {
      flex: 1,
    },
    editScroll: {
      paddingHorizontal: 18,
      paddingTop: 22,
      paddingBottom: 24,
      gap: 12,
    },
    editHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    headingText: {
      flex: 1,
      gap: 4,
    },
    subtitle: {
      color: c.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    editProfileButton: {
      minHeight: 54,
      paddingHorizontal: 24,
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
