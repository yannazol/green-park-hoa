import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import { useAppTheme } from '@/hooks/use-app-theme';
import getRecordPaymentStyles from '@/styles/record-payment-styles';

export type PaymentSubmission = {
  amount: string;
  referenceNumber: string;
  receiptBase64: string;
  receiptMimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  receiptFileName: string;
};

type Props = {
  onClose: () => void;
  onSubmit: (payment: PaymentSubmission) => Promise<void>;
};

const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;

function isReceiptMimeType(value: string): value is PaymentSubmission['receiptMimeType'] {
  return value === 'image/jpeg' || value === 'image/png' || value === 'image/webp';
}

export default function RecordPaymentForm({ onClose, onSubmit }: Props) {
  const c = useAppTheme();
  const s = getRecordPaymentStyles(c);

  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receipt, setReceipt] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const chooseReceipt = async () => {
    setPickerLoading(true);
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        base64: true,
        exif: false,
      });
      if (result.canceled) return;

      const selected = result.assets[0];
      if (!selected?.base64) {
        setError('Could not read the selected receipt image. Please choose another image.');
        return;
      }
      if (selected.fileSize && selected.fileSize > MAX_RECEIPT_BYTES) {
        setError('Choose a receipt image smaller than 3 MB.');
        return;
      }
      if (selected.base64.length > Math.ceil((MAX_RECEIPT_BYTES * 4) / 3)) {
        setError('Choose a receipt image smaller than 3 MB.');
        return;
      }
      const mimeType = selected.mimeType || 'image/jpeg';
      if (!isReceiptMimeType(mimeType)) {
        setError('Choose a JPEG, PNG, or WebP receipt image.');
        return;
      }
      setReceipt(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the image library.');
    } finally {
      setPickerLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount.trim() || !referenceNumber.trim() || !receipt?.base64) {
      setError('Enter the amount and reference number, and attach a receipt image.');
      return;
    }
    const receiptMimeType = receipt.mimeType || 'image/jpeg';
    if (!isReceiptMimeType(receiptMimeType)) {
      setError('Choose a JPEG, PNG, or WebP receipt image.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSubmit({
        amount: amount.trim(),
        referenceNumber: referenceNumber.trim(),
        receiptBase64: receipt.base64,
        receiptMimeType,
        receiptFileName: receipt.fileName || `receipt-${Date.now()}.jpg`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit the payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.formHeader}>
            <View style={s.formHeaderText}>
              <Text style={s.title}>Record a payment</Text>
              <Text style={s.subtitle}>Submit your payment for HOA verification.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close record payment"
              disabled={saving}
              onPress={onClose}
              style={s.closeButton}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={17} tintColor={c.text} />
            </Pressable>
          </View>

          <Input
            label="Amount (PHP)"
            placeholder="e.g. 2,500.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <Input
            label="Reference number"
            placeholder="e.g. GCash or bank reference"
            value={referenceNumber}
            onChangeText={setReferenceNumber}
            autoCapitalize="characters"
          />

          <View style={s.receiptSection}>
            <Text style={s.receiptLabel}>Add receipt</Text>
            <Text style={s.receiptHint}>JPEG, PNG, or WebP · maximum 3 MB</Text>
            {receipt && (
              <View style={s.receiptPreviewWrap}>
                <Image source={{ uri: receipt.uri }} style={s.receiptPreview} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove receipt"
                  onPress={() => setReceipt(null)}
                  style={s.removeReceipt}>
                  <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={14} tintColor={c.textInverse} />
                </Pressable>
                <Text numberOfLines={1} style={s.receiptName}>{receipt.fileName || 'Selected receipt'}</Text>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              disabled={pickerLoading}
              onPress={chooseReceipt}
              style={({ pressed }) => [s.chooseReceipt, pressed && s.chooseReceiptPressed]}>
              <Text style={s.chooseReceiptText}>
                {pickerLoading ? 'Opening photos…' : receipt ? 'Change receipt' : 'Choose receipt'}
              </Text>
            </Pressable>
          </View>

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <View style={s.actions}>
            <Button
              title="Submit payment"
              fullWidth
              loading={saving}
              disabled={pickerLoading}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
