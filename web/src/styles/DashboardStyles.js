import { spacing } from '../constants/theme';

export default function getDashboardStyles(c) {
  return {
    page: {
      minHeight: '100vh',
      padding: spacing[5],
      backgroundColor: c.bg,
      color: c.text,
    },
    content: {
      maxWidth: 560,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[4],
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[3],
    },
    label: { fontSize: 14, color: c.textSecondary },
    value: { fontSize: 16, fontWeight: 600, color: c.text },
  };
}