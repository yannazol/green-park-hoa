import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import OptionPicker from '@/components/option-picker';
import { VEHICLE_TYPES, type VehicleType } from '@/constants/sample-data';
import { useAppTheme } from '@/hooks/use-app-theme';
import getAddVehicleStyles from '@/styles/add-vehicle-styles';

type Props = {
  onClose: () => void;
  onSubmit?: () => void;
};

export default function AddVehicleForm({ onClose, onSubmit }: Props) {
  const c = useAppTheme();
  const s = getAddVehicleStyles(c);

  const [plate, setPlate] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [type, setType] = useState<VehicleType>('Car');

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
          <Text style={s.title}>Add vehicle</Text>
          <Text style={s.subtitle}>Register a household vehicle for gate access</Text>

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
