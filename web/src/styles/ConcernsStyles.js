import { radius, spacing } from '../constants/theme';

export default function getConcernsStyles(c) {
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
  };
  const chipActive = {
    ...chip,
    color: c.onPrimary,
    backgroundColor: c.primary,
    borderColor: c.primary,
    fontWeight: 600,
  };

  return {
    page: {
      minHeight: '100vh',
      padding: spacing[5],
      backgroundColor: c.bg,
      color: c.text,
    },
    content: {
      maxWidth: 1100,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[4],
    },
    backLink: {
      alignSelf: 'flex-start',
      fontSize: 14,
      color: c.textSecondary,
      textDecoration: 'none',
    },
    title: { 
      margin: 0, 
      fontSize: 24, 
      fontWeight: 700, 
      color: c.text 
    },
    subtitle: { 
      margin: '4px 0 0', 
      fontSize: 14, 
      color: c.textSecondary 
    },
    chips: { 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: spacing[2] 
    },
    chip,
    chipActive,
    message: { 
      margin: 0, 
      fontSize: 14, 
      color: c.textSecondary 
    },
    errorBox: {
      padding: '10px 12px',
      fontSize: 14,
      color: c.dangerText,
      backgroundColor: c.dangerBg,
      border: `1px solid ${c.dangerBorder}`,
      borderRadius: radius.sm,
    },
    detailBody: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: spacing[3] 
    },
    description: { 
      margin: 0, 
      fontSize: 15, 
      lineHeight: 1.5, 
      color: c.text, 
      whiteSpace: 'pre-wrap' 
    },
    metaLine: { 
      margin: 0, 
      fontSize: 13, 
      color: c.textSecondary 
    },
    fieldLabel: { 
      display: 'block', 
      marginBottom: 6, 
      fontSize: 14, 
      fontWeight: 600, 
      color: c.text 
    },
    textarea: {
      width: '100%',
      boxSizing: 'border-box',
      minHeight: 90,
      padding: '10px 12px',
      fontSize: 15,
      fontFamily: 'inherit',
      color: c.text,
      backgroundColor: c.bgCard,
      border: `1px solid ${c.borderStrong}`,
      borderRadius: radius.md,
      resize: 'vertical',
    },
    noticeSuccess: {
      padding: '10px 12px',
      fontSize: 14,
      color: c.successText,
      backgroundColor: c.successBg,
      border: `1px solid ${c.successBorder}`,
      borderRadius: radius.sm,
    },
    noticeError: {
      padding: '10px 12px',
      fontSize: 14,
      color: c.dangerText,
      backgroundColor: c.dangerBg,
      border: `1px solid ${c.dangerBorder}`,
      borderRadius: radius.sm,
    },
    actions: { display: 'flex', alignItems: 'center', gap: spacing[3] },
    linkButton: {
      padding: 0,
      fontSize: 14,
      fontFamily: 'inherit',
      color: c.textSecondary,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
    statGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: spacing[4],
    },
    toolbar: { display: 'flex', flexWrap: 'wrap', gap: spacing[3] },
    searchField: { flex: '2 1 240px', minWidth: 0 },
    filterField: { flex: '1 1 150px', minWidth: 0 },
    tabsRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[3],
    },
    tabsWrap: { flex: 1, minWidth: 0 },
    ticket: { fontSize: 13, fontWeight: 600, color: c.brand, whiteSpace: 'nowrap' },
    primaryText: { fontWeight: 500, color: c.text },
    secondaryText: { marginTop: 2, fontSize: 12, color: c.textSecondary },
    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: spacing[3],
    },
    pageButtons: { display: 'flex', alignItems: 'center', gap: spacing[3] },
    toastSuccess: {
      position: 'fixed',
      right: spacing[5],
      bottom: spacing[5],
      maxWidth: 'calc(100vw - 48px)',
      padding: '12px 16px',
      fontSize: 14,
      fontWeight: 500,
      color: c.successText,
      backgroundColor: c.successBg,
      border: `1px solid ${c.successBorder}`,
      borderRadius: radius.md,
      boxShadow: `0 8px 24px ${c.shadow}26`,
      zIndex: 400,
    },
    toastError: {
      position: 'fixed',
      right: spacing[5],
      bottom: spacing[5],
      maxWidth: 'calc(100vw - 48px)',
      padding: '12px 16px',
      fontSize: 14,
      fontWeight: 500,
      color: c.dangerText,
      backgroundColor: c.dangerBg,
      border: `1px solid ${c.dangerBorder}`,
      borderRadius: radius.md,
      boxShadow: `0 8px 24px ${c.shadow}26`,
      zIndex: 400,
    },
  };
}
