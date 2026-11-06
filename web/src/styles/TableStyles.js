import { radius } from '../constants/theme';

export default function getTableStyles(c) {
  return {
    wrapper: {
      width: '100%',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      backgroundColor: c.bgCard,
      border: `1px solid ${c.border}`,
      borderRadius: radius.lg,
    },
    table: {
      width: '100%',
      minWidth: 600,
      borderCollapse: 'collapse',
      fontSize: 14,
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left',
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      color: c.textSecondary,
      backgroundColor: c.bgMuted,
      borderBottom: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    },
    td: {
      padding: '12px 16px',
      color: c.text,
      borderBottom: `1px solid ${c.border}`,
      verticalAlign: 'middle',
    },
    row: {
      backgroundColor: c.bgCard,
    },
    rowClickable: {
      cursor: 'pointer',
    },
    rowHover: {
      backgroundColor: c.bgMuted,
    },
    empty: {
      padding: '32px 16px',
      textAlign: 'center',
      color: c.textSecondary,
    },
  };
}
