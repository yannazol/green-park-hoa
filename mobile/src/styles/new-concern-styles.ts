import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getNewConcernStyles(c: AppColors) {
  return StyleSheet.create({
    flex: { 
      flex: 1 
    },
    page: { 
      flex: 1, 
      backgroundColor: c.bg 
    },
    scroll: { 
      padding: 20, 
      gap: 16 
    },
    title: { 
      fontSize: 22, 
      fontWeight: '700', 
      color: c.text 
    },
    subtitle: { 
      fontSize: 14, 
      color: c.textSecondary, 
      marginTop: -8 
    },
    textArea: { 
      minHeight: 120, 
      paddingTop: 12, 
      textAlignVertical: 'top' 
    },
    errorBox: {
      padding: 12,
      backgroundColor: c.dangerBg,
      borderColor: c.dangerBorder,
      borderWidth: 1,
      borderRadius: radius.sm,
    },
    errorText: { 
      fontSize: 14, 
      color: c.dangerText 
    },
    actions: { 
      gap: 12 
    },
  });
}
