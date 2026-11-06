import { spacing, fontFamily } from '../constants/theme';

export default function getPlaceholderStyles(c) {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[2],
      fontFamily,
    },
    title: {
      margin: 0,
      fontSize: 24,
      fontWeight: 700,
      color: c.text,
    },
    subtitle: {
      margin: 0,
      fontSize: 14,
      color: c.textSecondary,
    },
  };
}

