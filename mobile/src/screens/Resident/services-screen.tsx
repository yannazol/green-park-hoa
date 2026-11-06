import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert, Modal, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge, { type BadgeVariant } from '@/components/badge';
import Button from '@/components/button';
import Card from '@/components/card';
import type { AssistanceType, VehicleType } from '@/constants/resident-options';
import { api } from '@/services/api';
import { useAppTheme } from '@/hooks/use-app-theme';
import AddVehicleForm from '@/screens/Resident/add-vehicle-form';
import SeniorAssistanceForm from '@/screens/Resident/senior-assistance-form';
import getCommunityStyles from '@/styles/community-styles';

type Vehicle = {
  _id: string;
  plateNumber: string;
  makeModel: string;
  type: VehicleType;
};
type GateFee = {
  _id: string;
  category: string;
  description: string;
  amountCentavos: number;
};
type Assistance = {
  _id: string;
  type: string;
  details: string;
  status: 'Pending' | 'In progress' | 'Done' | 'Cancelled';
  adminNote: string;
  createdAt: string;
};

const STATUS_VARIANT: Record<Assistance['status'], BadgeVariant> = {
  Pending: 'warning',
  'In progress': 'info',
  Done: 'success',
  Cancelled: 'neutral',
};
const formatMoney = (centavos: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(centavos / 100);
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeZone: 'Asia/Manila',
  }).format(new Date(value));

export default function ServicesScreen() {
  const c = useAppTheme();
  const s = getCommunityStyles(c);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fees, setFees] = useState<GateFee[]>([]);
  const [requests, setRequests] = useState<Assistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
  const [assistanceFormOpen, setAssistanceFormOpen] = useState(false);

  const load = useCallback(async () => {
    setError('');
    const results = await Promise.allSettled([
      api<{ vehicles: Vehicle[] }>('/community/vehicles'),
      api<{ fees: GateFee[] }>('/community/gate-fees'),
      api<{ requests: Assistance[] }>('/community/assistance/mine'),
    ]);
    const failures: string[] = [];
    if (results[0].status === 'fulfilled') setVehicles(results[0].value.vehicles);
    else failures.push(results[0].reason instanceof Error ? results[0].reason.message : 'Vehicles unavailable.');
    if (results[1].status === 'fulfilled') setFees(results[1].value.fees);
    else failures.push(results[1].reason instanceof Error ? results[1].reason.message : 'Gate fees unavailable.');
    if (results[2].status === 'fulfilled') setRequests(results[2].value.requests);
    else failures.push(results[2].reason instanceof Error ? results[2].reason.message : 'Assistance requests unavailable.');
    if (failures.length) setError(failures.join('\n'));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const registerVehicle = async (data: { plateNumber: string; makeModel: string; type: VehicleType }) => {
    setSaving(true);
    try {
      await api('/community/vehicles', { method: 'POST', body: data });
      setVehicleFormOpen(false);
      setNotice('Vehicle registration saved.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const removeVehicle = (vehicle: Vehicle) => {
    Alert.alert('Remove vehicle?', `${vehicle.plateNumber} will be removed from your registrations.`, [
      { text: 'Keep vehicle', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void api(`/community/vehicles/${vehicle._id}`, { method: 'DELETE' })
            .then(() => load())
            .catch((removeError: unknown) =>
              setError(removeError instanceof Error ? removeError.message : 'Could not remove vehicle.'),
            );
        },
      },
    ]);
  };

  const submitAssistance = async (request: { type: AssistanceType; details: string }) => {
    setSaving(true);
    try {
      await api('/community/assistance', { method: 'POST', body: request });
      setAssistanceFormOpen(false);
      setNotice('Your assistance request was submitted for HOA review.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={c.brand} />}>
        <View style={s.heading}>
          <Text style={s.title}>Community services</Text>
          <Text style={s.subtitle}>Manage household vehicles and request resident assistance.</Text>
        </View>
        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text><Button title="Retry" variant="outline" onPress={() => { setLoading(true); void load(); }} /></View> : null}
        {notice ? <View style={s.successBox}><Text style={s.successText}>{notice}</Text></View> : null}

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionHeading}>
              <Text style={s.sectionTitle}>My vehicles</Text>
              <Text style={s.sectionSubtitle}>Household vehicles registered for village access.</Text>
            </View>
            <Button title="Add" onPress={() => setVehicleFormOpen(true)} />
          </View>
          {loading ? <Card><Text style={s.muted}>Loading vehicles…</Text></Card> : vehicles.length === 0 ? (
            <Card style={s.emptyCard}>
              <Text style={s.emptyTitle}>No registered vehicles</Text>
              <Text style={s.muted}>Add a vehicle to keep your household registration current.</Text>
            </Card>
          ) : vehicles.map((vehicle) => (
            <Card key={vehicle._id} style={s.itemCard}>
              <View style={s.vehicleInfo}>
                <Text style={s.itemTitle}>{vehicle.plateNumber}</Text>
                <Text style={s.muted}>{vehicle.makeModel} · {vehicle.type}</Text>
              </View>
              <Button title="Remove" variant="outline" onPress={() => removeVehicle(vehicle)} />
            </Card>
          ))}
        </View>

        <View style={s.section}>
          <View style={s.sectionHeading}>
            <Text style={s.sectionTitle}>Gate-entry fees</Text>
            <Text style={s.sectionSubtitle}>Fee information published by the HOA.</Text>
          </View>
          {loading ? <Card><Text style={s.muted}>Loading fee information…</Text></Card> : fees.length === 0 ? (
            <Card style={s.emptyCard}>
              <Text style={s.emptyTitle}>No fees published</Text>
              <Text style={s.muted}>The HOA has not configured gate-entry fees.</Text>
            </Card>
          ) : fees.map((fee) => (
            <Card key={fee._id} style={s.feeCard}>
              <View style={s.feeHeader}>
                <Text style={s.itemTitle}>{fee.category}</Text>
                <Text style={s.feeAmount}>{fee.amountCentavos === 0 ? 'Free' : formatMoney(fee.amountCentavos)}</Text>
              </View>
              <Text style={s.muted}>{fee.description}</Text>
            </Card>
          ))}
          <Text style={s.finePrint}>Fees shown here are informational. No online gate-fee payment is configured in this app.</Text>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionHeading}>
              <Text style={s.sectionTitle}>Senior assistance</Text>
              <Text style={s.sectionSubtitle}>Requests are reviewed and updated by the HOA office.</Text>
            </View>
            <Button title="Request" onPress={() => setAssistanceFormOpen(true)} />
          </View>
          {loading ? <Card><Text style={s.muted}>Loading requests…</Text></Card> : requests.length === 0 ? (
            <Card style={s.emptyCard}>
              <Text style={s.emptyTitle}>No assistance requests</Text>
              <Text style={s.muted}>Submit a request for a registered senior resident in your household.</Text>
            </Card>
          ) : requests.map((request) => (
            <Card key={request._id} style={s.requestCard}>
              <View style={s.requestHeader}>
                <Text style={s.itemTitle}>{request.type}</Text>
                <Badge label={request.status} variant={STATUS_VARIANT[request.status]} />
              </View>
              <Text style={s.muted}>{request.details}</Text>
              <Text style={s.date}>Submitted {formatDate(request.createdAt)}</Text>
              {request.adminNote ? <View style={s.adminNote}><Text style={s.noteLabel}>HOA update</Text><Text style={s.noteText}>{request.adminNote}</Text></View> : null}
            </Card>
          ))}
        </View>
      </ScrollView>

      <Modal visible={vehicleFormOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVehicleFormOpen(false)}>
        <AddVehicleForm onClose={() => setVehicleFormOpen(false)} onSubmit={registerVehicle} submitting={saving} />
      </Modal>
      <Modal visible={assistanceFormOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAssistanceFormOpen(false)}>
        <SeniorAssistanceForm onClose={() => setAssistanceFormOpen(false)} onSubmit={submitAssistance} submitting={saving} />
      </Modal>
    </SafeAreaView>
  );
}
