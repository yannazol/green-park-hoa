import { StyleSheet } from 'react-native';

import { type AppColors } from '@/constants/theme';

export default function getBottomSheetModalStyles(c: AppColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      backgroundColor: c.bgOverlay,
      paddingTop: 24,
    },
    sheet: {
      width: '100%',
      maxWidth: 640,
      height: '92%',
      maxHeight: 820,
      overflow: 'hidden',
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      backgroundColor: c.bg,
    },
  });
}
