import { StyleSheet } from 'react-native';

import { BottomTabInset, type AppColors } from '@/constants/theme';

export default function getBookingsStyles(c: AppColors) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      padding: 20,
      paddingBottom: BottomTabInset + 20,
      gap: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: c.text,
    },
    section: {
      gap: 12,
    },
    sectionHeading: {
      fontSize: 20,
      fontWeight: '700',
      color: c.text,
    },
    facilityList: {
      gap: 12,
    },
    facilityCard: {
      gap: 8,
    },
    facilityName: {
      fontSize: 17,
      fontWeight: '700',
      color: c.text,
    },
    facilityDesc: {
      fontSize: 14,
      lineHeight: 20,
      color: c.textSecondary,
    },
    facilityFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: c.divider,
      gap: 12,
    },
    facilityFee: {
      fontSize: 13,
      fontWeight: '600',
      color: c.brand,
      flex: 1,
    },
    reservationList: {
      gap: 10,
    },
    reservationCard: {
      gap: 8,
    },
    reservationTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reservationFacility: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    reservationDateTime: {
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
  });
}
