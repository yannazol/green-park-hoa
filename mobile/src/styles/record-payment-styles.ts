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
    },
    scroll: {
      padding: 20,
      gap: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: c.text,
    },
    subtitle: {
      fontSize: 14,
      color: c.textSecondary,
      marginTop: -8,
    },
    actions: {
      gap: 12,
      marginTop: 8,
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
    },
    receiptPreview: {
      width: '100%',
      height: 190,
      borderRadius: 12,
      backgroundColor: c.bgMuted,
      resizeMode: 'contain',
    },
    receiptName: {
      fontSize: 12,
      color: c.textSecondary,
    },
    chooseReceipt: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 46,
      borderWidth: 1,
      borderColor: c.borderStrong,
      borderRadius: 8,
      backgroundColor: c.bgCard,
    },
    chooseReceiptPressed: {
      backgroundColor: c.bgMuted,
    },
    chooseReceiptText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.brand,
    },
    errorText: {
      fontSize: 13,
      lineHeight: 18,
      color: c.dangerText,
    },
  });
}
