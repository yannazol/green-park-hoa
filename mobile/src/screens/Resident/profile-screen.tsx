import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Alert, Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Card from '@/components/card';
import Input from '@/components/input';
import { useAuth } from '@/context/auth-context';
import { api } from '@/services/api';
import { useAppTheme } from '@/hooks/use-app-theme';
import getAccountStyles from '@/styles/account-styles';

type ResidentProfile = {
  id: string;
  name: string;
  email: string;
  unit: string;
  phone: string;
  residentType: string | null;
  createdAt: string;
};

export default function ProfileScreen() {
  const c = useAppTheme();
  const s = getAccountStyles(c);
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const { user: data } = await api<{ user: ResidentProfile }>('/profile');
      setProfile(data);
      setName(data.name);
      setPhone(data.phone ?? '');
      updateUser(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your profile.');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const saveProfile = async () => {
    setSaveError('');
    if (!name.trim() || name.trim().length > 80) {
      setSaveError('Name is required and must be 80 characters or fewer.');
      return;
    }
    if (phone.trim() && !/^[0-9+()\-\s]{7,30}$/.test(phone.trim())) {
      setSaveError('Enter a valid phone number.');
      return;
    }
    setSaving(true);
    try {
      const { user: updated } = await api<{ user: ResidentProfile }>('/profile', {
        method: 'PATCH',
        body: { name: name.trim(), phone: phone.trim() },
      });
      setProfile(updated);
      updateUser(updated);
      setEditing(false);
    } catch (saveFailure) {
      setSaveError(saveFailure instanceof Error ? saveFailure.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again to access resident services.', [
      { text: 'Stay signed in', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => { void logout(); } },
    ]);
  };

  const rows: [string, string][] = [
    ['Name', profile?.name ?? user?.name ?? ''],
    ['Email', profile?.email ?? user?.email ?? ''],
    ['Unit', profile?.unit || 'Not set'],
    ['Phone', profile?.phone || 'Not set'],
    ['Resident type', profile?.residentType || 'Not set'],
  ];

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.profileHeading}>
          <View style={s.headingText}>
            <Text style={s.title}>My account</Text>
            <Text style={s.subtitle}>Your Green Park Village resident profile.</Text>
          </View>
          <Button title="Edit" variant="outline" onPress={() => { setSaveError(''); setEditing(true); }} />
        </View>
        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text><Button title="Retry" variant="outline" onPress={() => { setLoading(true); void load(); }} /></View> : null}
        {loading ? <Card><Text style={s.emptyText}>Loading profile…</Text></Card> : (
          <View style={s.card}>
            {rows.map(([label, value], index) => (
              <View key={label} style={[s.row, index > 0 && s.rowDivider]}>
                <Text style={s.label}>{label}</Text>
                <Text style={s.value}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Community</Text>
          <Card style={s.linksCard}>
            <Button title="Announcements" variant="outline" fullWidth onPress={() => router.push('/announcements')} />
            <Button title="Vehicles & assistance" variant="outline" fullWidth onPress={() => router.push('/services')} />
            <Button title="Notification center" variant="outline" fullWidth onPress={() => router.push('/notifications')} />
          </Card>
        </View>

        <Button title="Sign out" variant="outline" fullWidth onPress={confirmSignOut} />
      </ScrollView>

      <Modal visible={editing} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditing(false)}>
        <SafeAreaView style={s.editPage} edges={['top']}>
          <ScrollView contentContainerStyle={s.editScroll} keyboardShouldPersistTaps="handled">
            <Text style={s.title}>Edit profile</Text>
            <Text style={s.subtitle}>Your email and unit are managed by the HOA office.</Text>
            {saveError ? <View style={s.errorBox}><Text style={s.errorText}>{saveError}</Text></View> : null}
            <Input label="Name" value={name} onChangeText={setName} maxLength={80} autoCapitalize="words" />
            <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={30} />
            <Button title="Save changes" fullWidth loading={saving} onPress={() => void saveProfile()} />
            <Button title="Cancel" fullWidth variant="outline" disabled={saving} onPress={() => setEditing(false)} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
