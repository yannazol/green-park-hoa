import { StyleSheet } from 'react-native';

import { type AppColors } from '@/constants/theme';

export default function getRecordPaymentStyles(c: AppColors) {
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
      paddingBottom: 18,
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
      color: c.text,
    },
    subtitle: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: -8,
    },
    actions: {
      gap: 12,
      marginTop: 3,
    },
    receiptSection: {
      gap: 8,
    },
    receiptLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    receiptHint: {
      fontSize: 12,
      color: c.textSecondary,
      textAlign: 'center',
    },
    receiptPreview: {
      width: '100%',
      height: 150,
      borderRadius: 12,
      backgroundColor: c.bgMuted,
      resizeMode: 'contain',
    },
    receiptPreviewWrap: {
      position: 'relative',
      gap: 7,
    },
    removeReceipt: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.primary,
    },
    receiptName: {
      fontSize: 12,
      color: c.textSecondary,
    },
    chooseReceipt: {
      minHeight: 108,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.brandBorder,
      borderRadius: 12,
      backgroundColor: c.bgCard,
    },
    chooseReceiptPressed: {
      backgroundColor: c.brandLight,
    },
    chooseReceiptText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    errorText: {
      fontSize: 13,
      lineHeight: 18,
      color: c.dangerText,
    },
  });
}
