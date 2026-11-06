import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import OptionPicker from '@/components/option-picker';
import { TIME_SLOT_OPTIONS, type TimeSlot } from '@/constants/resident-options';
import { useAppTheme } from '@/hooks/use-app-theme';
import getBookingFormStyles from '@/styles/booking-form-styles';

function todayInPhilippines() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

type Props = {
  facility: {
    _id: string;
    name: string;
    feeDescription: string;
  };
  onClose: () => void;
  onSubmit: (booking: {
    facility: string;
    date: string;
    timeSlot: TimeSlot;
    purpose: string;
    guestCount: number;
  }) => Promise<void>;
  onCheckAvailability: (date: string) => Promise<TimeSlot[]>;
  checkingAvailability: boolean;
  submitting: boolean;
  error: string;
};

export default function BookingForm({
  facility,
  onClose,
  onSubmit,
  onCheckAvailability,
  checkingAvailability,
  submitting,
  error,
}: Props) {
  const c = useAppTheme();
  const s = getBookingFormStyles(c);

  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('Morning');
  const [notes, setNotes] = useState('');
  const [guestCount, setGuestCount] = useState('1');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[] | null>(null);
  const [formError, setFormError] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');

  const checkSlots = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setAvailabilityError('Enter a date in YYYY-MM-DD format first.');
      return;
    }
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== date || date < todayInPhilippines()) {
      setAvailabilityError('Choose a valid date that is not in the past.');
      return;
    }
    setAvailabilityError('');
    setAvailableSlots(null);
    try {
      const slots = await onCheckAvailability(date);
      setAvailableSlots(slots);
      if (slots.length && !slots.includes(timeSlot)) setTimeSlot(slots[0]);
    } catch (availabilityFailure) {
      setAvailabilityError(
        availabilityFailure instanceof Error ? availabilityFailure.message : 'Could not check availability.',
      );
    }
  };

  const handleSubmit = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFormError('Enter a date in YYYY-MM-DD format.');
      return;
    }
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== date) {
      setFormError('Enter a valid calendar date.');
      return;
    }
    if (date < todayInPhilippines()) {
      setFormError('Choose a date that is not in the past.');
      return;
    }
    if (!notes.trim()) {
      setFormError('Tell us the purpose of this booking.');
      return;
    }
    const parsedGuestCount = Number(guestCount);
    if (!Number.isInteger(parsedGuestCount) || parsedGuestCount < 1 || parsedGuestCount > 200) {
      setFormError('Guest count must be a whole number between 1 and 200.');
      return;
    }
    if (availableSlots === null) {
      setFormError('Check availability for the selected date before submitting.');
      return;
    }
    if (!availableSlots.includes(timeSlot)) {
      setFormError('Select an available time slot.');
      return;
    }
    setFormError('');
    await onSubmit({
      facility: facility._id,
      date,
      timeSlot,
      purpose: notes.trim(),
      guestCount: parsedGuestCount,
    });
  };
  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>Request facility</Text>

          <View style={s.facilityBadge}>
            <Text style={s.facilityBadgeText}>{facility.name}</Text>
          </View>
          <Text style={s.feeDescription}>{facility.feeDescription}</Text>

          {formError || error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{formError || error}</Text>
            </View>
          ) : null}

          <Input
            label="Date"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={(value) => {
              setDate(value);
              setAvailableSlots(null);
              setAvailabilityError('');
            }}
          />

          <Button
            title={checkingAvailability ? 'Checking availability…' : 'Check availability'}
            variant="outline"
            loading={checkingAvailability}
            disabled={checkingAvailability}
            onPress={() => void checkSlots()}
          />
          {availabilityError ? <Text style={s.errorText}>{availabilityError}</Text> : null}
          {availableSlots?.length ? (
            <Text style={s.availableText}>
              Available: {TIME_SLOT_OPTIONS.filter(({ value }) => availableSlots.includes(value)).map(({ label }) => label).join(', ')}
            </Text>
          ) : availableSlots ? (
            <Text style={s.errorText}>No time slots are available on this date.</Text>
          ) : null}

          <OptionPicker
            label="Time slot"
            options={availableSlots
              ? TIME_SLOT_OPTIONS.filter(({ value }) => availableSlots.includes(value))
              : TIME_SLOT_OPTIONS}
            value={timeSlot}
            onChange={setTimeSlot}
          />

          <Input
            label="Guest count"
            placeholder="1"
            keyboardType="number-pad"
            value={guestCount}
            onChangeText={setGuestCount}
            maxLength={3}
          />

          <Input
            label="Notes"
            placeholder="Tell us what you are planning"
            multiline
            numberOfLines={3}
            maxLength={500}
            style={s.textArea}
            value={notes}
            onChangeText={setNotes}
          />

          <View style={s.actions}>
            <Button title="Submit request" fullWidth loading={submitting} onPress={() => void handleSubmit()} />
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
