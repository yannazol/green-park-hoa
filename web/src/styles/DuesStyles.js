import { radius, spacing, shadow, fontFamily } from '../constants/theme';

export default function getDuesStyles(c) {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[5],
      maxWidth: 1200,
      margin: '0 auto',
      fontFamily,
    },
    tableCard: {
      backgroundColor: c.bgCard,
      border: `1px solid ${c.border}`,
      borderRadius: radius.md,
      boxShadow: shadow.sm,
      overflow: 'hidden',
    },
    filterBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[3],
      flexWrap: 'wrap',
    },
    chips: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      flexWrap: 'wrap',
    },
    chip: {
      padding: '6px 14px',
      fontSize: 13,
      fontWeight: 500,
      fontFamily: 'inherit',
      color: c.textSecondary,
      backgroundColor: c.bgCard,
      border: `1px solid ${c.border}`,
      borderRadius: radius.lg,
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    chipActive: {
      padding: '6px 14px',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'inherit',
      color: c.onPrimary,
      backgroundColor: c.brand,
      border: `1px solid ${c.brand}`,
      borderRadius: radius.lg,
      cursor: 'pointer',
    },
    actionsCell: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
    emptyPendingBox: {
      padding: `${spacing[5]}px ${spacing[4]}px`,
      textAlign: 'center',
      backgroundColor: c.bgCard,
      border: `1px dashed ${c.borderStrong}`,
      borderRadius: radius.md,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacing[1],
      marginBottom: spacing[4],
    },
    emptyPendingTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: c.text,
      margin: 0,
    },
    emptyPendingSubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      margin: 0,
    },
    modalForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[4],
    },
    rejectDetailText: {
      fontSize: 14,
      color: c.textSecondary,
      margin: 0,
      lineHeight: 1.4,
    },
    modalActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing[3],
      marginTop: spacing[2],
    },
  };
}

