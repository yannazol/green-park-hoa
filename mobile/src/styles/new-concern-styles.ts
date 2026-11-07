import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getNewConcernStyles(c: AppColors) {
  return StyleSheet.create({
    flex: { 
      flex: 1,
    },
    page: {
      flex: 1,
      backgroundColor: c.bg,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      overflow: 'hidden',
    },
    scroll: {
      paddingHorizontal: 18,
      paddingTop: 22,
      paddingBottom: 12,
      gap: 9,
    },
    formHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    formHeaderText: {
      flex: 1,
      gap: 5,
    },
    title: { 
      fontSize: 21,
      fontWeight: '700', 
      color: c.text 
    },
    subtitle: { 
      fontSize: 13,
      color: c.textSecondary, 
      marginTop: -8 
    },
    textArea: { 
      minHeight: 84,
      paddingTop: 10,
      textAlignVertical: 'top',
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
      gap: 12,
      marginTop: 6,
    },
    submitButton: {
      minHeight: 56,
      marginHorizontal: -2,
    },
    photoSection: {
      gap: 8,
    },
    photoLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    uploadBox: {
      minHeight: 185,
      padding: 14,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.brandBorder,
      borderRadius: radius.md,
      backgroundColor: c.bgCard,
    },
    uploadBoxPressed: {
      backgroundColor: c.brandLight,
    },
    uploadTitle: {
      color: c.text,
      fontSize: 14,
      fontWeight: '700',
    },
    uploadHint: {
      color: c.textSecondary,
      fontSize: 11,
      textAlign: 'center',
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
