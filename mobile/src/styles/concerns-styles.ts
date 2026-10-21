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
  });
}