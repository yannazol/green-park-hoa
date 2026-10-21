import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import OptionPicker from '@/components/option-picker';
import { TIME_SLOT_OPTIONS, type TimeSlot } from '@/constants/sample-data';
import { useAppTheme } from '@/hooks/use-app-theme';
import getBookingFormStyles from '@/styles/booking-form-styles';

type Props = {
  facilityName: string;
  onClose: () => void;
  onSubmit?: () => void;
};

export default function BookingForm({ facilityName, onClose, onSubmit }: Props) {
  const c = useAppTheme();
  const s = getBookingFormStyles(c);

  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('Morning');
  const [notes, setNotes] = useState('');

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
          <Text style={s.title}>Request facility</Text>

          <View style={s.facilityBadge}>
            <Text style={s.facilityBadgeText}>{facilityName}</Text>
          </View>

          <Input
            label="Date"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />

          <OptionPicker
            label="Time slot"
            options={TIME_SLOT_OPTIONS}
            value={timeSlot}
            onChange={setTimeSlot}
          />

          <Input
            label="Notes"
            placeholder="Additional requirements or event details"
            multiline
            numberOfLines={3}
            style={s.textArea}
            value={notes}
            onChangeText={setNotes}
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
