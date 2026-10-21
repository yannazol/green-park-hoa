import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getBookingFormStyles(c: AppColors) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      padding: 20,
      gap: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: c.text,
    },
    facilityBadge: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: c.brandLight,
      borderRadius: radius.sm,
      alignSelf: 'flex-start',
      marginTop: -8,
    },
    facilityBadgeText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.brand,
    },
    textArea: {
      minHeight: 90,
      paddingTop: 12,
      textAlignVertical: 'top',
    },
    actions: {
      gap: 12,
      marginTop: 8,
    },
  });
}
