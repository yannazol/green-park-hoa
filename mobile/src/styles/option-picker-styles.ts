import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getOptionPickerStyles(c: AppColors) {
  return StyleSheet.create({
    field: { gap: 6 },
    label: { fontSize: 14, fontWeight: '600', color: c.text },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      minHeight: 44,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.borderStrong,
      backgroundColor: c.bgCard,
    },
    chipSelected: {
      borderColor: c.primary,
      backgroundColor: c.primary,
    },
    chipText: { fontSize: 14, color: c.text },
    chipTextSelected: { color: c.onPrimary, fontWeight: '600' },
  });
}
