import { radius, spacing, fontFamily } from '../constants/theme';

export default function getDashboardStyles(c) {
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
    sectionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
      gap: spacing[5],
      alignItems: 'start',
    },
    errorBox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spacing[3]}px ${spacing[4]}px`,
      fontSize: 14,
      color: c.dangerText,
      backgroundColor: c.dangerBg,
      border: `1px solid ${c.dangerBorder}`,
      borderRadius: radius.sm,
      gap: spacing[3],
    },
    attentionList: {
      display: 'flex',
      flexDirection: 'column',
    },
    attentionItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spacing[3]}px 0`,
      borderBottom: `1px solid ${c.divider}`,
      gap: spacing[3],
    },
    attentionItemLast: {
      borderBottom: 'none',
      paddingBottom: 0,
    },
    attentionInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[1],
      minWidth: 0,
    },
    attentionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      flexWrap: 'wrap',
    },
    attentionTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: c.text,
    },
    attentionMeta: {
      fontSize: 13,
      color: c.textSecondary,
    },
    loadingText: {
      fontSize: 14,
      color: c.textSecondary,
      margin: 0,
    },
  };
}
