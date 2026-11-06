import { radius, spacing, shadow, fontFamily } from '../constants/theme';

export default function getServicesStyles(c) {
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
    searchWrapper: {
      maxWidth: 380,
      width: '100%',
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
    detailText: {
      fontSize: 14,
      color: c.text,
      lineHeight: 1.5,
      margin: 0,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[4],
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

