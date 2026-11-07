import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import BottomSheetModal from '@/components/bottom-sheet-modal';
import Card from '@/components/card';
import Input from '@/components/input';
import ModalCloseButton from '@/components/modal-close-button';
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
  profilePhoto?: { mimeType: string; data: string } | null;
};

type RegisteredVehicle = {
  _id: string;
  plateNumber: string;
  makeModel: string;
  type: string;
  status?: string;
};

const MAX_PHOTO_BYTES = 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProfileScreen() {
  const c = useAppTheme();
  const s = getAccountStyles(c);
  const { user, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [vehicles, setVehicles] = useState<RegisteredVehicle[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [vehicleError, setVehicleError] = useState('');
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setVehicleError('');
    const [profileResult, vehiclesResult] = await Promise.allSettled([
      api<{ user: ResidentProfile }>('/profile'),
      api<{ vehicles: RegisteredVehicle[] }>('/community/vehicles'),
    ]);

    if (profileResult.status === 'fulfilled') {
      const { user: data } = profileResult.value;
      setProfile(data);
      setName(data.name);
      setPhone(data.phone ?? '');
      updateUser(data);
    } else {
      const loadError = profileResult.reason;
      setError(loadError instanceof Error ? loadError.message : 'Could not load your profile.');
    }

    if (vehiclesResult.status === 'fulfilled') {
      setVehicles(vehiclesResult.value.vehicles);
    } else {
      const loadError = vehiclesResult.reason;
      setVehicleError(loadError instanceof Error ? loadError.message : 'Could not load registered vehicles.');
    }
    setLoading(false);
    setVehiclesLoading(false);
  }, [updateUser]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const chooseProfilePhoto = async () => {
    setUploadingPhoto(true);
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
        exif: false,
      });
      if (result.canceled) return;
      const photo = result.assets[0];
      if (
        !photo?.base64 ||
        !PHOTO_TYPES.includes(photo.mimeType ?? '') ||
        (photo.fileSize ?? 0) > MAX_PHOTO_BYTES ||
        photo.base64.length > Math.ceil((MAX_PHOTO_BYTES * 4) / 3)
      ) {
        setError('Choose a JPEG, PNG, or WebP profile photo no larger than 1 MB.');
        return;
      }
      const { user: updated } = await api<{ user: ResidentProfile }>('/profile/photo', {
        method: 'PUT',
        body: {
          mimeType: photo.mimeType,
          data: photo.base64,
          name: photo.fileName || 'profile-photo',
        },
      });
      setProfile(updated);
      updateUser(updated);
    } catch (photoError) {
      setError(photoError instanceof Error ? photoError.message : 'Could not update your profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

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

  const rows: {
    label: string;
    value: string;
    icon: 'envelope' | 'phone' | 'house';
  }[] = [
    { label: 'Unit', value: profile?.unit || 'Not set', icon: 'house' },
    { label: 'Email', value: profile?.email ?? user?.email ?? '', icon: 'envelope' },
    { label: 'Phone', value: profile?.phone || 'Not set', icon: 'phone' },
  ];

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.profileHeader}>
          <Text style={s.pageEyebrow}>YOUR ACCOUNT</Text>
          <Text style={s.title}>My profile</Text>
        </View>

        <View style={s.profileCard}>
          <View style={s.profileHero}>
            <View style={s.avatarWrap}>
              {profile?.profilePhoto ? (
                <Image
                  source={{ uri: `data:${profile.profilePhoto.mimeType};base64,${profile.profilePhoto.data}` }}
                  accessibilityLabel="Profile photo"
                  style={s.avatar}
                />
              ) : (
                <View style={s.avatarFallback}>
                  <SymbolView
                    name={{ ios: 'person.fill', android: 'person', web: 'person' }}
                    size={42}
                    tintColor={c.brand}
                  />
                </View>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
                disabled={uploadingPhoto}
                onPress={() => void chooseProfilePhoto()}
                style={s.cameraButton}>
                {uploadingPhoto
                  ? <ActivityIndicator size="small" color={c.textInverse} />
                  : <SymbolView name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} size={17} tintColor={c.textInverse} />}
              </Pressable>
            </View>
            <Text style={s.profileName}>{profile?.name ?? user?.name ?? 'Resident'}</Text>
            <Text style={s.profileType}>
              {(profile?.residentType || user?.residentType || 'Resident').replaceAll('_', ' ')}
            </Text>
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
              <Button title="Retry" variant="outline" onPress={() => { setLoading(true); void load(); }} />
            </View>
          ) : null}

          <View style={s.profileSection}>
            <Text style={s.sectionTitle}>Personal details</Text>
            {loading ? (
              <Card style={s.loadingCard}><ActivityIndicator color={c.brand} /><Text style={s.emptyText}>Loading your profile…</Text></Card>
            ) : (
              <View style={s.infoCard}>
                {rows.map((row) => (
                  <View key={row.label} style={s.infoRow}>
                    <View style={s.infoIcon}>
                      <SymbolView
                        name={{
                          ios: row.icon === 'envelope' ? 'envelope' : row.icon === 'phone' ? 'phone' : 'house',
                          android: row.icon === 'envelope' ? 'mail' : row.icon === 'phone' ? 'call' : 'home',
                          web: row.icon === 'envelope' ? 'mail' : row.icon === 'phone' ? 'call' : 'home',
                        }}
                        size={20}
                        tintColor={c.brand}
                      />
                    </View>
                    <View style={s.infoText}>
                      <Text style={s.label}>{row.label}</Text>
                      <Text style={s.value}>{row.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={s.vehiclesSection}>
            <Text style={s.sectionTitle}>Registered Vehicles</Text>
            {vehiclesLoading ? (
              <Text style={s.noVehicles}>Loading registered vehicles…</Text>
            ) : vehicleError ? (
              <Text style={s.noVehicles}>{vehicleError}</Text>
            ) : vehicles.length === 0 ? (
              <Text style={s.noVehicles}>No registered vehicles yet.</Text>
            ) : (
              <View style={s.vehicleList}>
                {vehicles.map((vehicle) => (
                  <View key={vehicle._id} style={s.vehicleRow}>
                    <View style={s.vehicleIcon}>
                      <SymbolView
                        name={{ ios: 'car.side', android: 'directions_car', web: 'directions_car' }}
                        size={22}
                        tintColor={c.brand}
                      />
                    </View>
                    <View style={s.vehicleDetails}>
                      <Text style={s.vehiclePlate}>{vehicle.plateNumber}</Text>
                      <Text style={s.vehicleDescription}>{vehicle.type} · {vehicle.makeModel}</Text>
                    </View>
                    {vehicle.status ? (
                      <View style={s.vehicleStatus}>
                        <Text style={s.vehicleStatusText}>{vehicle.status}</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>

          <Button
            title="Edit profile"
            variant="brandOutline"
            icon={{ ios: 'pencil', android: 'edit', web: 'edit' }}
            fullWidth
            style={s.editProfileButton}
            onPress={() => { setSaveError(''); setEditing(true); }}
          />
          <View style={s.signOutSection}>
            <Button
              title="Sign out"
              variant="ghost"
              icon={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
              iconSize={24}
              iconColor={c.danger}
              fullWidth
              style={s.signOutButton}
              onPress={confirmSignOut}
            />
          </View>
        </View>
      </ScrollView>

      <BottomSheetModal visible={editing} sheetHeight="72%" onRequestClose={() => setEditing(false)}>
        <SafeAreaView style={s.editPage} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={s.editFlex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={s.editScroll} keyboardShouldPersistTaps="handled">
              <View style={s.editHeader}>
                <View style={s.headingText}>
                  <Text style={s.title}>Edit profile</Text>
                  <Text style={s.subtitle}>Your email and unit are managed by the HOA office.</Text>
                </View>
                <ModalCloseButton accessibilityLabel="Close edit profile" disabled={saving} onPress={() => setEditing(false)} />
              </View>
              {saveError ? <View style={s.errorBox}><Text style={s.errorText}>{saveError}</Text></View> : null}
              <Input label="Name" value={name} onChangeText={setName} maxLength={80} autoCapitalize="words" />
              <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={30} />
              <Button title="Save changes" fullWidth loading={saving} onPress={() => void saveProfile()} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
