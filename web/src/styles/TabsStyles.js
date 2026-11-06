import { spacing, fontFamily } from '../constants/theme';

export default function getTabsStyles(c) {
  return {
    tablist: {
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${c.divider}`,
      gap: spacing[2],
      overflowX: 'auto',
      fontFamily,
    },
    tab: {
      background: 'transparent',
      border: 'none',
      borderBottom: '2px solid transparent',
      padding: `${spacing[3]}px ${spacing[3]}px`,
      fontSize: 14,
      fontWeight: 500,
      fontFamily: 'inherit',
      color: c.textSecondary,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      marginBottom: -1,
      transition: 'color 0.15s, border-color 0.15s',
      outline: 'none',
    },
    tabHover: {
      color: c.text,
    },
    tabFocus: {
      outline: `2px solid ${c.brand}`,
      outlineOffset: -2,
    },
    tabActive: {
      color: c.brand,
      fontWeight: 600,
      borderBottom: `2px solid ${c.brand}`,
    },
  };
}
