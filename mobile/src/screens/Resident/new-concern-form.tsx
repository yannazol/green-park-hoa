import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import OptionPicker from '@/components/option-picker';
import {
  CATEGORY_OPTIONS,
  TYPE_OPTIONS,
  type ConcernCategory,
  type ConcernType,
} from '@/constants/concerns';
import { useAppTheme } from '@/hooks/use-app-theme';
import { api } from '@/services/api';
import getNewConcernStyles from '@/styles/new-concern-styles';

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function NewConcernForm({ onClose, onCreated }: Props) {
  const c = useAppTheme();
  const s = getNewConcernStyles(c);

  const [type, setType] = useState<ConcernType>('complaint');
  const [category, setCategory] = useState<ConcernCategory | ''>('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleSubmit = async () => {
    setError('');

    if (!category) {
      setError('Please choose a category.');
      return;
    }
    if (!subject.trim() || !description.trim()) {
      setError('Please fill in the subject and description.');
      return;
    }

    setSubmitting(true);
    let created = false;
    try {
      await api('/concerns', {
        method: 'POST',
        body: { type, category, subject: subject.trim(), description: description.trim() },
      });
      created = true;
      if (mounted.current) onCreated();
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      if (!created && mounted.current) setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>New concern</Text>
          <Text style={s.subtitle}>Tell the HOA what needs attention</Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <OptionPicker label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
          <OptionPicker
            label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
          />

          <Input
            label="Subject"
            placeholder="Short title, e.g. Broken street light"
            maxLength={120}
            value={subject}
            onChangeText={setSubject}
          />
          <Input
            label="Description"
            placeholder="Describe what happened and where"
            multiline
            maxLength={2000}
            style={s.textArea}
            value={description}
            onChangeText={setDescription}
          />

          <View style={s.actions}>
            <Button title="Submit" fullWidth loading={submitting} onPress={handleSubmit} />
            <Button
              title="Cancel"
              variant="outline"
              fullWidth
              disabled={submitting}
              onPress={onClose}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
