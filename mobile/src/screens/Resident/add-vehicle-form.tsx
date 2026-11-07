import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import ModalCloseButton from '@/components/modal-close-button';
import OptionPicker from '@/components/option-picker';
import { VEHICLE_TYPES, type VehicleType } from '@/constants/resident-options';
import { useAppTheme } from '@/hooks/use-app-theme';
import getAddVehicleStyles from '@/styles/add-vehicle-styles';

type Props = {
  onClose: () => void;
  submitting?: boolean;
  onSubmit: (vehicle: { plateNumber: string; makeModel: string; type: VehicleType }) => Promise<void>;
};

export default function AddVehicleForm({ onClose, onSubmit, submitting = false }: Props) {
  const c = useAppTheme();
  const s = getAddVehicleStyles(c);

  const [plate, setPlate] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [type, setType] = useState<VehicleType>('Car');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const normalizedPlate = plate.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9 -]{1,15}$/.test(normalizedPlate)) {
      setError('Enter a valid plate number.');
      return;
    }
    if (!makeModel.trim() || makeModel.trim().length > 80) {
      setError('Make and model are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({ plateNumber: normalizedPlate, makeModel: makeModel.trim(), type });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not register vehicle.');
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
              <Text style={s.title}>Add vehicle</Text>
              <Text style={s.subtitle}>Register a household vehicle for gate access</Text>
            </View>
            <ModalCloseButton
              accessibilityLabel="Close add vehicle"
              disabled={saving || submitting}
              onPress={onClose}
            />
          </View>

          <Input
            label="Plate number"
            placeholder="e.g. ABC 1234"
            autoCapitalize="characters"
            value={plate}
            onChangeText={setPlate}
          />

          <Input
            label="Make / Model"
            placeholder="e.g. Toyota Vios"
            value={makeModel}
            onChangeText={setMakeModel}
          />

          <OptionPicker
            label="Vehicle type"
            options={VEHICLE_TYPES}
            value={type}
            onChange={setType}
          />

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <View style={s.actions}>
            <Button title="Register vehicle" fullWidth loading={saving || submitting} onPress={() => void handleSubmit()} />
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
