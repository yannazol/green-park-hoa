import { radius, spacing, shadow, fontFamily } from '../constants/theme';

export default function getReservationsStyles(c) {
  const chip = {
    padding: '6px 14px',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'inherit',
    color: c.text,
    backgroundColor: c.bgCard,
    border: `1px solid ${c.borderStrong}`,
    borderRadius: radius.lg,
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  const chipActive = {
    ...chip,
    color: c.onPrimary,
    backgroundColor: c.primary,
    borderColor: c.primary,
    fontWeight: 600,
  };

  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[5],
      maxWidth: 1200,
      margin: '0 auto',
      fontFamily,
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[4],
      flexWrap: 'wrap',
    },
    chips: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      flexWrap: 'wrap',
    },
    chip,
    chipActive,
    facilitySelectWrapper: {
      minWidth: 200,
    },
    tableCard: {
      backgroundColor: c.bgCard,
      border: `1px solid ${c.border}`,
      borderRadius: radius.md,
      boxShadow: shadow.sm,
      overflow: 'hidden',
    },
    modalBody: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[4],
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: spacing[4],
    },
    detailRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[1],
    },
    detailLabel: {
      fontSize: 12,
      fontWeight: 500,
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },
    detailValue: {
      fontSize: 15,
      fontWeight: 600,
      color: c.text,
    },
    conflictBox: {
      padding: '12px 14px',
      fontSize: 14,
      color: c.dangerText,
      backgroundColor: c.dangerBg,
      border: `1px solid ${c.dangerBorder}`,
      borderRadius: radius.sm,
      lineHeight: 1.4,
    },
    noticeSuccess: {
      padding: '12px 14px',
      fontSize: 14,
      color: c.successText,
      backgroundColor: c.successBg,
      border: `1px solid ${c.successBorder}`,
      borderRadius: radius.sm,
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

