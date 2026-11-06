import { StyleSheet } from 'react-native';

import { BottomTabInset, radius, type AppColors } from '@/constants/theme';

export default function getNotificationStyles(c: AppColors) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    content: {
      padding: 20,
      paddingBottom: BottomTabInset + 20,
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    headerText: {
      flex: 1,
      gap: 4,
    },
    title: {
      color: c.text,
      fontSize: 26,
      fontWeight: '700',
    },
    subtitle: {
      color: c.textSecondary,
      fontSize: 14,
    },
    list: {
      gap: 10,
    },
    card: {
      gap: 8,
      borderLeftWidth: 3,
      borderLeftColor: 'transparent',
    },
    unreadCard: {
      borderLeftColor: c.brand,
      backgroundColor: c.bgAccent,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    titleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 8,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.brand,
    },
    cardTitle: {
      flex: 1,
      color: c.text,
      fontSize: 15,
      fontWeight: '700',
    },
    category: {
      color: c.brand,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'capitalize',
    },
    message: {
      color: c.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    date: {
      color: c.textMuted,
      fontSize: 12,
    },
    emptyCard: {
      alignItems: 'center',
      gap: 10,
      padding: 24,
    },
    emptyTitle: {
      color: c.text,
      fontSize: 16,
      fontWeight: '700',
    },
    emptyText: {
      color: c.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    errorText: {
      color: c.dangerText,
      fontSize: 14,
      textAlign: 'center',
    },
  });
}
