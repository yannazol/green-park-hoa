import { radius, spacing, fontFamily } from '../constants/theme';

export default function getButtonStyles(c) {
  return {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      border: '1px solid transparent',
      borderRadius: radius.sm,
      fontFamily,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background-color 0.15s, opacity 0.15s',
    },
    sizes: {
      sm: { padding: '6px 12px', fontSize: 13 },
      md: { padding: '10px 16px', fontSize: 14 },
      lg: { padding: '12px 22px', fontSize: 16 },
    },
    variants: {
      primary: { backgroundColor: c.primary, color: c.onPrimary },
      secondary: {
        backgroundColor: c.bgCard,
        color: c.text,
        border: `1px solid ${c.borderStrong}`,
      },
      danger: { backgroundColor: c.danger, color: c.textInverse },
      ghost: { backgroundColor: 'transparent', color: c.brand },
    },
    hover: {
      primary: { backgroundColor: c.primaryHover },
      secondary: { backgroundColor: c.bgMuted },
      danger: { opacity: 0.9 },
      ghost: { backgroundColor: c.brandLight },
    },
    full: { width: '100%' },
    disabled: { opacity: 0.55, cursor: 'not-allowed' },
  };
}