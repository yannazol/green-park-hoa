import { radius, spacing, shadow, fontFamily } from '../constants/theme';

export default function getReportsStyles(c) {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[5],
      maxWidth: 1200,
      margin: '0 auto',
      fontFamily,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: spacing[4],
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
      gap: spacing[5],
    },
    chartBody: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[3],
    },
    chartRow: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
    },
    chartLabel: {
      width: 95,
      fontSize: 13,
      fontWeight: 500,
      color: c.text,
      flexShrink: 0,
    },
    barTrack: {
      flex: 1,
      height: 14,
      backgroundColor: c.bgMuted,
      borderRadius: radius.sm,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: radius.sm,
      transition: 'width 0.3s ease',
    },
    chartValue: {
      minWidth: 80,
      fontSize: 13,
      fontWeight: 600,
      color: c.textSecondary,
      textAlign: 'right',
      flexShrink: 0,
    },
    tableCard: {
      backgroundColor: c.bgCard,
      border: `1px solid ${c.border}`,
      borderRadius: radius.md,
      boxShadow: shadow.sm,
      overflow: 'hidden',
    },
    loadingText: {
      fontSize: 14,
      color: c.textSecondary,
      margin: 0,
      padding: spacing[2],
    },
    errorBox: {
      padding: `${spacing[3]}px ${spacing[4]}px`,
      fontSize: 14,
      color: c.dangerText,
      backgroundColor: c.dangerBg,
      border: `1px solid ${c.dangerBorder}`,
      borderRadius: radius.sm,
    },
  };
}

