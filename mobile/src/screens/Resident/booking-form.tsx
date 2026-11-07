import { useEffect, useMemo, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import ModalCloseButton from '@/components/modal-close-button';
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

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function dateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return value;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`;
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
    timeSlot: string;
    schedulePeriod: TimeSlot;
    purpose: string;
    guestCount: number;
  }) => Promise<void>;
  onCheckAvailability: (date: string, schedule: TimeSlot) => Promise<string[]>;
  submitting: boolean;
  error: string;
};

export default function BookingForm({
  facility,
  onClose,
  onSubmit,
  onCheckAvailability,
  submitting,
  error,
}: Props) {
  const c = useAppTheme();
  const s = getBookingFormStyles(c);
  const today = todayInPhilippines();
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(`${today.slice(0, 7)}`);
  const [schedule, setSchedule] = useState<TimeSlot>('Morning');
  const [selectedSlot, setSelectedSlot] = useState<{ key: string; time: string } | null>(null);
  const [availability, setAvailability] = useState<{
    key: string;
    slots: string[];
    error: string;
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [guestCount, setGuestCount] = useState('1');
  const [formError, setFormError] = useState('');
  const availabilityKey = `${date}:${schedule}`;
  const hasCurrentAvailability = availability?.key === availabilityKey;
  const availableSlots = hasCurrentAvailability ? availability.slots : [];
  const availabilityError = hasCurrentAvailability ? availability.error : '';
  const checkingAvailability = !hasCurrentAvailability;
  const selectedTime = selectedSlot?.key === availabilityKey ? selectedSlot.time : '';

  const days = useMemo(() => {
    const [year, monthNumber] = month.split('-').map(Number);
    const first = new Date(Date.UTC(year, monthNumber - 1, 1));
    const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const cellCount = Math.ceil((first.getUTCDay() + daysInMonth) / 7) * 7;
    const start = new Date(Date.UTC(year, monthNumber - 1, 1 - first.getUTCDay()));
    return Array.from({ length: cellCount }, (_, index) => {
      const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + index));
      return { key: dateKey(current), day: current.getUTCDate(), inMonth: current.getUTCMonth() === monthNumber - 1 };
    });
  }, [month]);

  useEffect(() => {
    let active = true;
    void onCheckAvailability(date, schedule)
      .then((slots) => {
        if (active) {
          setAvailability({
            key: availabilityKey,
            slots,
            error: slots.length === 0
              ? 'No available times for this period. Try another date or period.'
              : '',
          });
        }
      })
      .catch((availabilityFailure: unknown) => {
        if (active) {
          setAvailability({
            key: availabilityKey,
            slots: [],
            error: availabilityFailure instanceof Error
              ? availabilityFailure.message
              : 'Could not load available times.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [availabilityKey, date, onCheckAvailability, schedule]);

  const moveMonth = (amount: number) => {
    const [year, monthNumber] = month.split('-').map(Number);
    setMonth(monthKey(new Date(Date.UTC(year, monthNumber - 1 + amount, 1))));
  };

  const handleSubmit = async () => {
    if (!selectedTime || !availableSlots.includes(selectedTime)) {
      setFormError('Choose an available time before requesting this facility.');
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
    setFormError('');
    await onSubmit({
      facility: facility._id,
      date,
      timeSlot: selectedTime,
      schedulePeriod: schedule,
      purpose: notes.trim(),
      guestCount: parsedGuestCount,
    });
  };

  return (
    <SafeAreaView style={s.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.formHeader}>
            <View style={s.formHeaderText}>
              <Text style={s.eyebrow}>FACILITY REQUEST</Text>
              <Text style={s.title}>Book {facility.name}</Text>
              <Text style={s.feeDescription}>{facility.feeDescription}</Text>
            </View>
            <ModalCloseButton accessibilityLabel="Close booking request" disabled={submitting} onPress={onClose} />
          </View>

          {formError || error ? (
            <View style={s.errorBox}><Text style={s.errorText}>{formError || error}</Text></View>
          ) : null}

          <View style={s.calendar}>
            <View style={s.calendarHeader}>
              <Text style={s.calendarTitle}>
                {new Intl.DateTimeFormat('en-PH', { month: 'long', year: 'numeric', timeZone: 'UTC' })
                  .format(new Date(`${month}-01T12:00:00Z`))}
              </Text>
              <View style={s.monthActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Previous month"
                  disabled={month <= today.slice(0, 7)}
                  onPress={() => moveMonth(-1)}
                  style={s.monthButton}>
                  <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} size={16} tintColor={c.text} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
                  onPress={() => moveMonth(1)}
                  style={s.monthButton}>
                  <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={16} tintColor={c.text} />
                </Pressable>
              </View>
            </View>
            <View style={s.weekdays}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text key={`${day}-${index}`} style={s.weekday}>{day}</Text>
              ))}
            </View>
            <View style={s.calendarGrid}>
              {days.map((day) => {
                const disabled = day.key < today;
                const chosen = date === day.key;
                return (
                  <Pressable
                    key={day.key}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${day.key}`}
                    accessibilityState={{ selected: chosen, disabled }}
                    disabled={disabled}
                    onPress={() => { setDate(day.key); setFormError(''); }}
                    style={[s.calendarDay, !day.inMonth && s.calendarDayOutside]}>
                    <View style={chosen ? s.selectedDayCircle : undefined}>
                      <Text style={[s.calendarDayText, chosen && s.calendarDayTextSelected, disabled && s.calendarDayDisabled]}>
                        {day.day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={s.guestRow}>
            <View style={s.guestLabel}>
              <SymbolView name={{ ios: 'person.2', android: 'group', web: 'group' }} size={19} tintColor={c.brand} />
              <Text style={s.fieldLabel}>Guests</Text>
            </View>
            <TextInput
              accessibilityLabel="Guest count"
              keyboardType="number-pad"
              maxLength={3}
              value={guestCount}
              onChangeText={setGuestCount}
              style={s.guestsInput}
            />
          </View>

          <View style={s.section}>
            <Text style={s.fieldLabel}>Schedule</Text>
            <View style={s.scheduleRow}>
              {TIME_SLOT_OPTIONS.map(({ value, label }) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: schedule === value }}
                  onPress={() => { setSchedule(value); setFormError(''); }}
                  style={[s.scheduleButton, schedule === value && s.scheduleButtonSelected]}>
                  <Text style={[s.scheduleText, schedule === value && s.scheduleTextSelected]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.fieldLabel}>Available times</Text>
            {checkingAvailability ? (
              <Text style={s.availableHint}>Checking facility hours…</Text>
            ) : availableSlots.length ? (
              <View style={s.slotGrid}>
                {availableSlots.map((slot) => (
                  <Pressable
                    key={slot}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedTime === slot }}
                    onPress={() => { setSelectedSlot({ key: availabilityKey, time: slot }); setFormError(''); }}
                    style={[s.slotButton, selectedTime === slot && s.slotButtonSelected]}>
                    <Text style={[s.slotText, selectedTime === slot && s.slotTextSelected]}>{formatTime(slot)}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={availabilityError ? s.errorText : s.availableHint}>
                {availabilityError || 'No available times for this period.'}
              </Text>
            )}
          </View>

          <Input
            label="Purpose"
            placeholder="Tell us what you are planning"
            multiline
            numberOfLines={3}
            maxLength={500}
            style={s.textArea}
            value={notes}
            onChangeText={setNotes}
          />

          <Button
            title="Request booking"
            icon={{ ios: 'calendar.badge.clock', android: 'event_available', web: 'event_available' }}
            fullWidth
            style={s.submitButton}
            loading={submitting}
            disabled={checkingAvailability || !selectedTime}
            onPress={() => void handleSubmit()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
