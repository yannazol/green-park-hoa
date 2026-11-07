import { StyleSheet } from 'react-native';

import { BottomTabInset, type AppColors } from '@/constants/theme';

export default function getDuesStyles(c: AppColors) {
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
    pageHeader: {
      gap: 5,
      marginBottom: 2,
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.1,
      color: c.primary,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: c.text,
    },
    summaryCard: {
      gap: 12,
    },
    summaryTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    balanceLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    balanceAmount: {
      fontSize: 34,
      fontWeight: '800',
      color: c.text,
    },
    dueDate: {
      fontSize: 14,
      color: c.textSecondary,
    },
    paidThroughRow: {
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: c.divider,
    },
    paidThroughText: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textSecondary,
    },
    recordButton: {
      marginTop: 4,
    },
    section: {
      gap: 12,
    },
    sectionHeading: {
      fontSize: 20,
      fontWeight: '700',
      color: c.text,
    },
    historyList: {
      gap: 10,
    },
    historyCard: {
      gap: 8,
    },
    historyTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    historyMonth: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    historyBottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    historyAmount: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    historyRef: {
      fontSize: 13,
      color: c.textSecondary,
    },
    emptyCard: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    emptySubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 14,
      color: c.dangerText,
    },
    rejectionText: {
      fontSize: 13,
      lineHeight: 18,
      color: c.dangerText,
    },
    creditText: {
      fontSize: 13,
      lineHeight: 18,
      color: c.successText,
    },
  });
}
