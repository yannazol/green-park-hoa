import { radius, spacing, shadow, fontFamily } from '../constants/theme';

export default function getStatCardStyles(c) {
  return {
    card: {
      position: 'relative',
      backgroundColor: c.bgCard,
      border: `1px solid ${c.border}`,
      borderRadius: radius.md,
      padding: spacing[4],
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[2],
      overflow: 'hidden',
      boxShadow: shadow.sm,
      fontFamily,
      boxSizing: 'border-box',
    },
    accentBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
    },
    label: {
      fontSize: 13,
      fontWeight: 500,
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },
    valueRow: {
      display: 'flex',
      alignItems: 'baseline',
      gap: spacing[2],
    },
    value: {
      fontSize: 28,
      fontWeight: 700,
      color: c.text,
      lineHeight: 1.1,
    },
    hint: {
      fontSize: 12,
      color: c.textSecondary,
      lineHeight: 1.3,
    },
    accents: {
      neutral: c.borderStrong,
      success: c.success,
      warning: c.warning,
      danger: c.danger,
      info: c.info,
    },
  };
}

