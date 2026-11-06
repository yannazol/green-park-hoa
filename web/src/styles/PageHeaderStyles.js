import { spacing, fontFamily } from '../constants/theme';

export default function getPageHeaderStyles(c) {
  return {
    container: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing[4],
      flexWrap: 'wrap',
      fontFamily,
    },
    textWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[1],
      minWidth: 0,
    },
    title: {
      margin: 0,
      fontSize: 24,
      fontWeight: 700,
      color: c.text,
      lineHeight: 1.25,
    },
    subtitle: {
      margin: 0,
      fontSize: 14,
      color: c.textSecondary,
      lineHeight: 1.4,
    },
    action: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
  };
}

