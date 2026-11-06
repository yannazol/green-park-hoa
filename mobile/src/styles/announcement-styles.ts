import { StyleSheet } from 'react-native';

import { BottomTabInset, radius, type AppColors } from '@/constants/theme';

export default function getAnnouncementStyles(c: AppColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.bg,
    },
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    content: {
      padding: 20,
      paddingBottom: BottomTabInset + 20,
      gap: 14,
    },
    title: {
      color: c.text,
      fontSize: 26,
      fontWeight: '700',
    },
    subtitle: {
      marginBottom: 4,
      color: c.textSecondary,
      fontSize: 14,
    },
    card: {
      gap: 10,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    date: {
      color: c.textSecondary,
      fontSize: 12,
    },
    cardTitle: {
      color: c.text,
      fontSize: 17,
      fontWeight: '700',
      lineHeight: 23,
    },
    message: {
      color: c.text,
      fontSize: 14,
      lineHeight: 21,
    },
    readMore: {
      alignSelf: 'flex-start',
      paddingVertical: 2,
    },
    readMoreText: {
      color: c.brand,
      fontSize: 13,
      fontWeight: '700',
    },
    images: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    image: {
      width: '48%',
      height: 150,
      borderRadius: radius.sm,
      backgroundColor: c.bgMuted,
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
