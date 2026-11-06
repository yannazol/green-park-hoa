import { StyleSheet } from 'react-native';

import { type AppColors } from '@/constants/theme';

export default function getSeniorAssistanceStyles(c: AppColors) {
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
    subtitle: {
      fontSize: 14,
      color: c.textSecondary,
      marginTop: -8,
    },
    textArea: {
      minHeight: 90,
      paddingTop: 12,
      textAlignVertical: 'top',
    },
    actions: {
      gap: 12,
    },
    errorText: {
      color: c.dangerText,
      fontSize: 14,
      marginTop: 8,
    },
  });
}
