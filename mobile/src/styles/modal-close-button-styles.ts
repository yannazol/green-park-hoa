import { StyleSheet } from 'react-native';

import { type AppColors } from '@/constants/theme';

export default function getModalCloseButtonStyles(c: AppColors) {
  return StyleSheet.create({
    button: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgMuted,
    },
    pressed: {
      opacity: 0.75,
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
