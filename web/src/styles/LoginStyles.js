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
      maxWidth: 440,
      margin: '0 auto',
    },
    brand: {
      textAlign: 'center',
      marginBottom: spacing[5],
    },
    brandLogo: {
      display: 'block',
      width: 120,
      height: 120,
      objectFit: 'contain',
      margin: `0 auto ${spacing[4]}px`,
    },
    brandName: {
      margin: 0,
      fontSize: 25,
      fontWeight: 700,
      color: c.text,
    },
    brandTagline: {
      margin: '4px 0 0',
      fontSize: 14,
      color: c.textSecondary,
    },
    card: {
      borderRadius: 22,
      boxShadow: `0 14px 36px ${c.shadow}18`,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[4],
    },
    authInput: {
      minHeight: 52,
      padding: '12px 14px',
      borderRadius: 14,
      borderColor: c.border,
      fontSize: 15,
    },
    authInputWithAdornment: {
      minHeight: 52,
      padding: '12px 58px 12px 14px',
      borderRadius: 14,
      borderColor: c.border,
      fontSize: 15,
    },
    submitButton: {
      minHeight: 54,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      backgroundColor: c.brand,
      borderColor: c.brand,
      borderRadius: 14,
      fontSize: 15,
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
      width: 44,
      height: 44,
      border: 'none',
      padding: 0,
      background: 'transparent',
      color: c.brand,
      borderRadius: '50%',
      cursor: 'pointer',
    },
  };
}