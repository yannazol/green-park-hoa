import { radius, spacing, fontFamily } from '../constants/theme';

export default function getSelectStyles(c) {
  return {
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[1],
      fontFamily,
    },
    label: {
      fontSize: 13,
      fontWeight: 500,
      color: c.text,
    },
    selectWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      fontSize: 14,
      fontFamily: 'inherit',
      color: c.text,
      backgroundColor: c.bgCard,
      border: `1px solid ${c.border}`,
      borderRadius: radius.sm,
      outline: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    },
    option: {
      color: c.text,
      backgroundColor: c.bgCard,
    },
    selectFocused: {
      borderColor: c.brand,
      boxShadow: `0 0 0 3px ${c.brandLight}`,
    },
    selectError: {
      borderColor: c.danger,
    },
    selectErrorFocused: {
      borderColor: c.danger,
      boxShadow: `0 0 0 3px ${c.dangerBg}`,
    },
    selectDisabled: {
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

