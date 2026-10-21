import { StyleSheet } from 'react-native';

import { BottomTabInset, radius, type AppColors } from '@/constants/theme';

export default function getHomeStyles(c: AppColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.brand,
    },
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scroll: {
      paddingBottom: BottomTabInset + 20,
    },
    header: {
      backgroundColor: c.brand,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 24,
      gap: 16,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    communityName: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textInverse,
      letterSpacing: 0.2,
    },
    bellButton: {
      minWidth: 44,
      minHeight: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bellButtonPressed: {
      opacity: 0.7,
    },
    greetingBlock: {
      gap: 4,
    },
    greetingText: {
      fontSize: 22,
      fontWeight: '700',
      color: c.textInverse,
    },
    dateText: {
      fontSize: 14,
      color: c.textInverse,
      opacity: 0.85,
    },
    body: {
      paddingHorizontal: 20,
      paddingTop: 20,
      gap: 24,
    },
    section: {
      gap: 10,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    sectionHeading: {
      fontSize: 20,
      fontWeight: '700',
      color: c.text,
    },
    duesCard: {
      gap: 12,
    },
    duesHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    duesMonth: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    duesAmount: {
      fontSize: 32,
      fontWeight: '800',
      color: c.text,
    },
    duesDueDate: {
      fontSize: 14,
      color: c.textSecondary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    tile: {
      width: '48%',
      flexGrow: 1,
      minHeight: 64,
      backgroundColor: c.bgCard,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: radius.md,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    tilePressed: {
      opacity: 0.7,
    },
    tileIconBox: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: c.brandLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tileLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      flex: 1,
    },
    announcementCard: {
      gap: 8,
    },
    announcementTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
    },
    announcementDate: {
      fontSize: 13,
      color: c.textSecondary,
    },
    announcementPreview: {
      fontSize: 14,
      lineHeight: 20,
      color: c.textSecondary,
    },
  });
}
