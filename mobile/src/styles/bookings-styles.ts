import { StyleSheet } from 'react-native';

import { BottomTabInset, radius, type AppColors } from '@/constants/theme';

export default function getBookingsStyles(c: AppColors) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: c.bg,
    },
    messageCard: {
      gap: 12,
    },
    errorText: {
      fontSize: 14,
      lineHeight: 20,
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
      minHeight: 220,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: radius.lg,
      backgroundColor: c.brand,
      borderWidth: 1,
      borderColor: c.borderLight,
    },
    facilityImage: {
      ...StyleSheet.absoluteFill,
      width: '100%',
      height: '100%',
    },
    facilityPhotoPlaceholder: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.brand,
    },
    facilityOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(20,35,28,0.68)',
    },
    facilityContent: {
      minHeight: 220,
      padding: 18,
      justifyContent: 'flex-end',
      gap: 8,
    },
    facilityRequestButton: {
      minHeight: 44,
      paddingHorizontal: 18,
    },
    facilityName: {
      fontSize: 21,
      fontWeight: '700',
      color: c.textInverse,
    },
    facilityDesc: {
      fontSize: 14,
      lineHeight: 20,
      color: c.textInverse,
      opacity: 0.88,
    },
    facilityFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 7,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.3)',
      gap: 8,
    },
    facilityFee: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textInverse,
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
    reservationActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    detailPage: {
      flex: 1,
      backgroundColor: c.bg,
    },
    detailScroll: {
      padding: 20,
      paddingBottom: BottomTabInset + 20,
      gap: 14,
    },
    detailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    detailTitleGroup: {
      flex: 1,
      gap: 4,
    },
    detailTitle: {
      color: c.text,
      fontSize: 21,
      fontWeight: '700',
    },
    detailCard: {
      padding: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      backgroundColor: c.bgCard,
    },
    detailLabel: {
      color: c.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    detailText: {
      color: c.text,
      fontSize: 14,
      lineHeight: 20,
    },
    detailMeta: {
      color: c.textMuted,
      fontSize: 12,
    },
    noteBox: {
      padding: 14,
      gap: 6,
      borderRadius: radius.md,
      backgroundColor: c.bgAccent,
    },
    noteLabel: {
      color: c.brand,
      fontSize: 13,
      fontWeight: '700',
    },
    timelineRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    timelineDot: {
      width: 9,
      height: 9,
      marginTop: 5,
      borderRadius: 5,
      backgroundColor: c.brand,
    },
    timelineText: {
      flex: 1,
      gap: 3,
      paddingBottom: 8,
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
