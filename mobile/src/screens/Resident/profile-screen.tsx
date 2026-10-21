import { useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '@/components/badge';
import Button from '@/components/button';
import Card from '@/components/card';
import {
  sampleGateEntryFees,
  sampleSeniorAssistanceDesc,
  sampleVehicles,
  type Vehicle,
} from '@/constants/sample-data';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import AddVehicleForm from '@/screens/Resident/add-vehicle-form';
import SeniorAssistanceForm from '@/screens/Resident/senior-assistance-form';
import getAccountStyles from '@/styles/account-styles';

export default function ProfileScreen() {
  const c = useAppTheme();
  const s = getAccountStyles(c);
  const { user, logout } = useAuth();

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showSeniorModal, setShowSeniorModal] = useState(false);
  const [vehicles] = useState<Vehicle[]>(sampleVehicles);

  if (!user) return null;

  const rows: [string, string][] = [
    ['Name', user.name],
    ['Email', user.email],
    ['Unit', user.unit || 'Not set'],
  ];

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Profile</Text>

        {/* Existing Details Card */}
        <View style={s.card}>
          {rows.map(([label, value], index) => (
            <View key={label} style={[s.row, index > 0 && s.rowDivider]}>
              <Text style={s.label}>{label}</Text>
              <Text style={s.value}>{value}</Text>
            </View>
          ))}
        </View>

        {/* 1. My vehicles */}
        <Card style={s.sectionCard}>
          <Text style={s.sectionTitle}>My vehicles</Text>

          {vehicles.length === 0 ? (
            <Text style={s.emptyText}>No registered vehicles.</Text>
          ) : (
            <View style={s.vehicleList}>
              {vehicles.map((veh, index) => (
                <View key={veh.id} style={[s.vehicleRow, index > 0 && s.rowDivider]}>
                  <View style={s.vehicleInfo}>
                    <Text style={s.plateNumber}>{veh.plateNumber}</Text>
                    <Text style={s.makeModel}>{veh.makeModel}</Text>
                  </View>
                  <Badge label={veh.type} variant="neutral" />
                </View>
              ))}
            </View>
          )}

          <Button
            title="Add vehicle"
            variant="outline"
            fullWidth
            style={s.actionButton}
            onPress={() => setShowVehicleModal(true)}
          />
        </Card>

        {/* 2. Gate-entry fees */}
        <Card style={s.sectionCard}>
          <Text style={s.sectionTitle}>Gate-entry fees</Text>
          {sampleGateEntryFees.length === 0 ? (
            <Text style={s.emptyText}>No gate-entry fees available.</Text>
          ) : (
            <View style={s.feeList}>
              {sampleGateEntryFees.map((fee, index) => (
                <View key={fee.id} style={[s.feeRow, index > 0 && s.rowDivider]}>
                  <Text style={s.feeCategory}>{fee.category}</Text>
                  <Text style={s.feeAmount}>{fee.amount}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* 3. Senior citizen assistance */}
        <Card style={s.sectionCard}>
          <Text style={s.sectionTitle}>Senior citizen assistance</Text>
          <Text style={s.assistanceDesc}>{sampleSeniorAssistanceDesc}</Text>
          <Button
            title="Request assistance"
            variant="outline"
            fullWidth
            style={s.actionButton}
            onPress={() => setShowSeniorModal(true)}
          />
        </Card>

        {/* Sign out */}
        <Button title="Sign out" variant="outline" fullWidth onPress={logout} />
      </ScrollView>

      {/* Add vehicle Modal */}
      <Modal
        visible={showVehicleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVehicleModal(false)}>
        <AddVehicleForm onClose={() => setShowVehicleModal(false)} />
      </Modal>

      {/* Senior assistance Modal */}
      <Modal
        visible={showSeniorModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSeniorModal(false)}>
        <SeniorAssistanceForm onClose={() => setShowSeniorModal(false)} />
      </Modal>
    </SafeAreaView>
  );
}
