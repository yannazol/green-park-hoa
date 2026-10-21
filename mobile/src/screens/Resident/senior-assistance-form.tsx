import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import OptionPicker from '@/components/option-picker';
import { ASSISTANCE_TYPES, type AssistanceType } from '@/constants/sample-data';
import { useAppTheme } from '@/hooks/use-app-theme';
import getSeniorAssistanceStyles from '@/styles/senior-assistance-styles';

type Props = {
  onClose: () => void;
  onSubmit?: () => void;
};

export default function SeniorAssistanceForm({ onClose, onSubmit }: Props) {
  const c = useAppTheme();
  const s = getSeniorAssistanceStyles(c);

  const [type, setType] = useState<AssistanceType>('Grocery delivery');
  const [details, setDetails] = useState('');

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
          <Text style={s.title}>Request assistance</Text>
          <Text style={s.subtitle}>Senior citizen support and welfare request</Text>

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
            style={s.textArea}
            value={details}
            onChangeText={setDetails}
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
