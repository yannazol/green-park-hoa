import { radius } from '../constants/theme';

export default function getBadgeStyles(c) {
  return {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 600,
      borderRadius: radius.lg,
      border: '1px solid transparent',
      whiteSpace: 'nowrap',
    },
    variants: {
      success: {
        backgroundColor: c.successBg,
        borderColor: c.successBorder,
        color: c.successText,
      },
      warning: {
        backgroundColor: c.warningBg,
        borderColor: c.warningBorder,
        color: c.warningText,
      },
      danger: {
        backgroundColor: c.dangerBg,
        borderColor: c.dangerBorder,
        color: c.dangerText,
      },
      info: {
        backgroundColor: c.infoBg,
        borderColor: c.infoBorder,
        color: c.infoText,
      },
      neutral: {
        backgroundColor: c.bgMuted,
        borderColor: c.border,
        color: c.textSecondary,
      },
    },
  };
}