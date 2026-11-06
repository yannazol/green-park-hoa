import { StyleSheet } from 'react-native';

import { BottomTabInset, radius, type AppColors } from '@/constants/theme';

export default function getAccountStyles(c: AppColors) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      padding: 20,
      paddingBottom: BottomTabInset + 20,
      gap: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: c.text,
    },
    profileHeading: {
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
      fontSize: 14,
      lineHeight: 20,
    },
    card: {
      backgroundColor: c.bgCard,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: radius.lg,
      paddingHorizontal: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      gap: 12,
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: c.divider,
    },
    label: {
      fontSize: 14,
      color: c.textSecondary,
    },
    value: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      flexShrink: 1,
      textAlign: 'right',
    },
    sectionCard: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
    },
    vehicleList: {
      gap: 4,
    },
    vehicleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 12,
    },
    vehicleInfo: {
      gap: 2,
      flex: 1,
    },
    plateNumber: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    makeModel: {
      fontSize: 13,
      color: c.textSecondary,
    },
    emptyText: {
      fontSize: 14,
      color: c.textSecondary,
      paddingVertical: 8,
    },
    feeList: {
      gap: 2,
    },
    feeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 12,
    },
    feeCategory: {
      fontSize: 14,
      color: c.text,
      flex: 1,
    },
    feeAmount: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    assistanceDesc: {
      fontSize: 14,
      lineHeight: 20,
      color: c.textSecondary,
    },
    actionButton: {
      marginTop: 4,
    },
    section: {
      gap: 10,
    },
    linksCard: {
      gap: 10,
    },
    editPage: {
      flex: 1,
      backgroundColor: c.bg,
    },
    editScroll: {
      padding: 20,
      paddingBottom: 32,
      gap: 16,
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