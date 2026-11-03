import { radius, spacing } from '../constants/theme';

export default function getLoginStyles(c) {
  return {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[4],
      backgroundColor: c.bg,
    },
    container: {
      width: '100%',
      maxWidth: 400,
    },
    brand: {
      textAlign: 'center',
      marginBottom: spacing[5],
    },
    brandName: {
      margin: 0,
      fontSize: 24,
      fontWeight: 700,
      color: c.text,
    },
    brandTagline: {
      margin: '4px 0 0',
      fontSize: 14,
      color: c.textSecondary,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[4],
    },
    errorBox: {
      padding: '10px 12px',
      fontSize: 14,
      color: c.dangerText,
      backgroundColor: c.dangerBg,
      border: `1px solid ${c.dangerBorder}`,
      borderRadius: radius.sm,
    },
    passwordToggle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      border: 'none',
      padding: 0,
      background: 'transparent',
      color: c.textSecondary,
      cursor: 'pointer',
    },
  };
}