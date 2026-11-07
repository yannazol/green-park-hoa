import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getNewConcernStyles(c: AppColors) {
  return StyleSheet.create({
    flex: { 
      flex: 1 
    },
    page: { 
      flex: 1, 
      backgroundColor: c.bg 
    },
    scroll: { 
      padding: 20, 
      paddingBottom: 32,
      gap: 16 
    },
    formHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    formHeaderText: {
      flex: 1,
      gap: 8,
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgMuted,
    },
    title: { 
      fontSize: 22, 
      fontWeight: '700', 
      color: c.text 
    },
    subtitle: { 
      fontSize: 14, 
      color: c.textSecondary, 
      marginTop: -8 
    },
    textArea: { 
      minHeight: 120, 
      paddingTop: 12, 
      textAlignVertical: 'top' 
    },
    errorBox: {
      padding: 12,
      backgroundColor: c.dangerBg,
      borderColor: c.dangerBorder,
      borderWidth: 1,
      borderRadius: radius.sm,
    },
    errorText: { 
      fontSize: 14, 
      color: c.dangerText 
    },
    actions: { 
      gap: 12 
    },
    photoSection: {
      gap: 10,
    },
    photoLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    photoHint: {
      marginTop: -6,
      fontSize: 12,
      color: c.textSecondary,
    },
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    photoThumb: {
      width: 52,
      height: 52,
      borderRadius: radius.sm,
      backgroundColor: c.bgMuted,
    },
    photoName: {
      flex: 1,
      color: c.textSecondary,
      fontSize: 13,
    },
    removePhoto: {
      padding: 8,
    },
    removePhotoText: {
      color: c.dangerText,
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
