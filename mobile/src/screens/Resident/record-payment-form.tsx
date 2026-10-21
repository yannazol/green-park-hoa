import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import { useAppTheme } from '@/hooks/use-app-theme';
import getRecordPaymentStyles from '@/styles/record-payment-styles';

type Props = {
  onClose: () => void;
  onSubmit?: () => void;
};

export default function RecordPaymentForm({ onClose, onSubmit }: Props) {
  const c = useAppTheme();
  const s = getRecordPaymentStyles(c);

  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  const handleSubmit = () => {
    // UI only for now - closes modal
    onSubmit ? onSubmit() : onClose();
  };

  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>Record a payment</Text>
          <Text style={s.subtitle}>Enter the details of your dues payment</Text>

          <Input
            label="Amount"
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
          />

          <View style={s.actions}>
            <Button title="Submit" fullWidth onPress={handleSubmit} />
            <Button
              title="Cancel"
              variant="outline"
              fullWidth
              onPress={onClose}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
