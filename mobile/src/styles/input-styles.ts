import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getInputStyles(c: AppColors) {
  return StyleSheet.create({
    field: { gap: 6 },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    input: {
      minHeight: 48,
      paddingHorizontal: 14,
      fontSize: 16,
      borderWidth: 1,
      borderRadius: radius.md,
      color: c.text,
      backgroundColor: c.bgCard,
      borderColor: c.borderStrong,
    },
    inputFocused: {
      borderColor: c.primary,
    },
    inputError: {
      borderColor: c.danger,
    },
    message: { fontSize: 13 },
    messageError: { color: c.dangerText },
    helperText: { color: c.textSecondary },
    placeholder: { color: c.textMuted },
  });
}
