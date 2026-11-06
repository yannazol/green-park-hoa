import { radius, spacing, fontFamily } from '../constants/theme';

export default function getAnnouncementsStyles(c) {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[5],
      maxWidth: 1000,
      margin: '0 auto',
      fontFamily,
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[4],
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing[3],
    },
    titleWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[1],
      minWidth: 0,
    },
    cardTitle: {
      margin: 0,
      fontSize: 17,
      fontWeight: 600,
      color: c.text,
      lineHeight: 1.3,
    },
    cardDate: {
      margin: 0,
      fontSize: 13,
      color: c.textSecondary,
    },
    cardBody: {
      marginTop: spacing[3],
    },
    bodyPreview: {
      margin: 0,
      fontSize: 14,
      lineHeight: 1.5,
      color: c.text,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    bodyFull: {
      margin: 0,
      fontSize: 14,
      lineHeight: 1.5,
      color: c.text,
      whiteSpace: 'pre-wrap',
    },
    toggleButton: {
      padding: 0,
      marginTop: spacing[2],
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'inherit',
      color: c.brand,
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[4],
    },
    textareaField: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing[1],
    },
    textareaLabel: {
      fontSize: 13,
      fontWeight: 500,
      color: c.text,
    },
    textarea: {
      width: '100%',
      boxSizing: 'border-box',
      minHeight: 110,
      padding: '10px 12px',
      fontSize: 14,
      fontFamily: 'inherit',
      color: c.text,
      backgroundColor: c.bgCard,
      border: `1px solid ${c.border}`,
      borderRadius: radius.sm,
      resize: 'vertical',
      outline: 'none',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    },
    textareaError: {
      borderColor: c.danger,
    },
    textareaFocused: {
      borderColor: c.brand,
      boxShadow: `0 0 0 3px ${c.brandLight}`,
    },
    textareaErrorFocused: {
      borderColor: c.danger,
      boxShadow: `0 0 0 3px ${c.dangerBg}`,
    },
    messageError: {
      fontSize: 12,
      color: c.dangerText,
    },
    modalActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing[3],
      marginTop: spacing[2],
    },
    emptyMessage: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
      padding: spacing[6],
    },
  };
}

