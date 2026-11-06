import { radius, spacing, fontFamily } from '../constants/theme';

export default function getInputStyles(c) {
  return {
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[1],
    },
    label: {
      fontSize: 13,
      fontWeight: 500,
      color: c.text,
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      fontSize: 14,
      fontFamily,
      color: c.text,
      backgroundColor: c.bgCard,
      border: `1px solid ${c.border}`,
      borderRadius: radius.sm,
      outline: 'none',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    },
    inputWithEndAdornment: {
      paddingRight: 40,
    },
    endAdornment: {
      position: 'absolute',
      right: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'auto',
    },
    inputFocused: {
      borderColor: c.brand,
      boxShadow: `0 0 0 3px ${c.brandLight}`,
    },
    inputError: {
      borderColor: c.danger,
    },
    inputErrorFocused: {
      borderColor: c.danger,
      boxShadow: `0 0 0 3px ${c.dangerBg}`,
    },
    inputDisabled: {
      backgroundColor: c.bgMuted,
      cursor: 'not-allowed',
    },
    message: {
      fontSize: 12,
      color: c.textSecondary,
    },
    messageError: {
      fontSize: 12,
      color: c.dangerText,
    },
  };
}