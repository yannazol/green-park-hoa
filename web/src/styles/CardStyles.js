import { radius, spacing, shadow } from '../constants/theme';

export default function getCardStyles(c) {
  return {
    card: {
      backgroundColor: c.bgCard,
      border: `1px solid ${c.border}`,
      borderRadius: radius.md,
      boxShadow: shadow.sm,
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[3],
      padding: `${spacing[4]}px ${spacing[5]}px`,
      borderBottom: `1px solid ${c.border}`,
    },
    title: {
      margin: 0,
      fontSize: 16,
      fontWeight: 600,
      color: c.text,
    },
    subtitle: {
      margin: 0,
      marginTop: 2,
      fontSize: 12,
      color: c.textSecondary,
    },
    body: {
      padding: spacing[5],
    },
    bodyNoPadding: {
      padding: 0,
    },
  };
}