import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getCardStyles(c: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.bgCard,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: 16,
    },
  });
}
