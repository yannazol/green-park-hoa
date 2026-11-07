import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import ModalCloseButton from '@/components/modal-close-button';
import OptionPicker from '@/components/option-picker';
import { ASSISTANCE_TYPES, type AssistanceType } from '@/constants/resident-options';
import { useAppTheme } from '@/hooks/use-app-theme';
import getSeniorAssistanceStyles from '@/styles/senior-assistance-styles';

type Props = {
  onClose: () => void;
  submitting?: boolean;
  onSubmit: (request: { type: AssistanceType; details: string }) => Promise<void>;
};

export default function SeniorAssistanceForm({ onClose, onSubmit, submitting = false }: Props) {
  const c = useAppTheme();
  const s = getSeniorAssistanceStyles(c);

  const [type, setType] = useState<AssistanceType>('Grocery delivery');
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!details.trim() || details.trim().length > 1000) {
      setError('Describe the assistance needed (up to 1,000 characters).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({ type, details: details.trim() });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit the request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <View style={s.headerText}>
              <Text style={s.title}>Request assistance</Text>
              <Text style={s.subtitle}>Senior citizen support and welfare request</Text>
            </View>
            <ModalCloseButton
              accessibilityLabel="Close assistance request"
              disabled={saving || submitting}
              onPress={onClose}
            />
          </View>

          <OptionPicker
            label="Assistance type"
            options={ASSISTANCE_TYPES}
            value={type}
            onChange={setType}
          />

          <Input
            label="Details"
            placeholder="Describe what help is needed, preferred time, or notes"
            multiline
            numberOfLines={4}
            maxLength={1000}
            style={s.textArea}
            value={details}
            onChangeText={setDetails}
          />

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <View style={s.actions}>
            <Button title="Submit request" fullWidth loading={saving || submitting} onPress={() => void handleSubmit()} />
            <Button
              title="Cancel"
              variant="outline"
              fullWidth
              disabled={saving || submitting}
              onPress={onClose}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
