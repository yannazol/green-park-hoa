import { StyleSheet } from 'react-native';

import { BottomTabInset, radius, type AppColors } from '@/constants/theme';

export default function getConcernsStyles(c: AppColors) {
  return StyleSheet.create({
    page: { 
      flex: 1, 
      backgroundColor: c.bg 
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    title: { fontSize: 24, fontWeight: '700', color: c.text },
    newButton: { minHeight: 48, paddingHorizontal: 14 },
    loadingState: {
      alignItems: 'center',
      gap: 12,
      marginTop: 40,
    },
    loadingText: {
      fontSize: 14,
      color: c.textSecondary,
    },
    list: { 
      padding: 20, 
      paddingBottom: BottomTabInset + 20, 
      gap: 12 
    },
    card: {
      padding: 16,
      gap: 8,
      backgroundColor: c.bgCard,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: radius.lg,
    },
    cardPressed: {
      opacity: 0.82,
    },
    cardTop: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start', 
      gap: 12 
    },
    subject: { 
      flex: 1, 
      fontSize: 16, 
      fontWeight: '600', 
      color: c.text 
    },
    meta: { 
      fontSize: 13, 
      color: c.textSecondary, 
      textTransform: 'capitalize' 
    },
    date: { 
     fontSize: 12, 
     color: c.textMuted 
    },
    noteBox: {
      padding: 10,
      backgroundColor: c.bgSecondary,
      borderColor: c.borderLight,
      borderWidth: 1,
      borderRadius: radius.sm,
      gap: 2,
    },
    noteLabel: { 
      fontSize: 12, 
      fontWeight: '600', 
      color: c.textSecondary 
    },
    noteText: { 
      fontSize: 14, 
      color: c.text 
    },
    empty: { 
      textAlign: 'center', 
      color: c.textSecondary, 
      marginTop: 40 
    },
    errorBox: {
      padding: 12,
      marginBottom: 12,
      backgroundColor: c.dangerBg,
      borderColor: c.dangerBorder,
      borderWidth: 1,
      borderRadius: radius.sm,
      gap: 10,
    },
    errorText: { fontSize: 14, color: c.dangerText },
    retryButton: {
      alignSelf: 'flex-start',
      minHeight: 44,
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
    detailHeaderText: {
      flex: 1,
      gap: 4,
    },
    detailTitle: {
      color: c.text,
      fontSize: 20,
      fontWeight: '700',
    },
    detailStatusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    detailCard: {
      padding: 16,
      gap: 10,
      backgroundColor: c.bgCard,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: radius.lg,
    },
    detailSectionTitle: {
      color: c.text,
      fontSize: 15,
      fontWeight: '700',
    },
    detailDescription: {
      color: c.text,
      fontSize: 14,
      lineHeight: 21,
    },
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    detailPhoto: {
      width: '48%',
      height: 150,
      borderRadius: radius.sm,
      backgroundColor: c.bgMuted,
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
    timelineBody: {
      flex: 1,
      gap: 3,
      paddingBottom: 8,
    },
    timelineTitle: {
      color: c.text,
      fontSize: 14,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
  });
}