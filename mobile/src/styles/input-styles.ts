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
    inputContainer: {
      position: 'relative',
      justifyContent: 'center',
    },
    input: {
      minHeight: 48,
      paddingHorizontal: 14,
      paddingRight: 42,
      fontSize: 16,
      borderWidth: 1,
      borderRadius: radius.md,
      color: c.text,
      backgroundColor: c.bgCard,
      borderColor: c.borderStrong,
    },
    inputWithRightElement: {
      paddingRight: 42,
    },
    rightElement: {
      position: 'absolute',
      top: 0,
      right: 4,
      bottom: 0,
      width: 44,
      justifyContent: 'center',
      alignItems: 'center',
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
