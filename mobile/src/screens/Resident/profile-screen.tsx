import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
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
  profilePhoto?: { mimeType: string; data: string } | null;
};

const MAX_PHOTO_BYTES = 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProfileScreen() {
  const c = useAppTheme();
  const s = getAccountStyles(c);
  const { user, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
    icon: 'person' | 'envelope' | 'phone' | 'house';
  }[] = [
    { label: 'Resident name', value: profile?.name ?? user?.name ?? '', icon: 'person' },
    { label: 'Resident type', value: profile?.residentType || 'Not set', icon: 'person' },
    { label: 'Unit', value: profile?.unit || 'Not set', icon: 'house' },
    { label: 'Email', value: profile?.email ?? user?.email ?? '', icon: 'envelope' },
    { label: 'Phone', value: profile?.phone || 'Not set', icon: 'phone' },
  ];

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.profileHero}>
          <Text style={s.pageEyebrow}>YOUR ACCOUNT</Text>
          <Text style={s.title}>My profile</Text>
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
            {profile?.unit || user?.unit ? ` · Unit ${profile?.unit || user?.unit}` : ''}
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
              {rows.map((row, index) => (
                <View key={row.label} style={[s.infoRow, index > 0 && s.rowDivider]}>
                  <View style={s.infoIcon}>
                    <SymbolView
                      name={{
                        ios: row.icon === 'person' ? 'person' : row.icon === 'envelope' ? 'envelope' : row.icon === 'phone' ? 'phone' : 'house',
                        android: row.icon === 'person' ? 'person' : row.icon === 'envelope' ? 'mail' : row.icon === 'phone' ? 'call' : 'home',
                        web: row.icon === 'person' ? 'person' : row.icon === 'envelope' ? 'mail' : row.icon === 'phone' ? 'call' : 'home',
                      }}
                      size={18}
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

        <Button
          title="Edit profile"
          fullWidth
          onPress={() => { setSaveError(''); setEditing(true); }}
        />
        <View style={s.signOutSection}>
          <Text style={s.signOutCaption}>Securely end your resident session on this device.</Text>
          <Button title="Sign out" variant="outline" fullWidth onPress={confirmSignOut} />
        </View>
      </ScrollView>

      <Modal visible={editing} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditing(false)}>
        <SafeAreaView style={s.editPage} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={s.editScroll} keyboardShouldPersistTaps="handled">
            <View style={s.editHeader}>
              <View style={s.headingText}>
                <Text style={s.title}>Edit profile</Text>
                <Text style={s.subtitle}>Your email and unit are managed by the HOA office.</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close edit profile"
                disabled={saving}
                onPress={() => setEditing(false)}
                style={s.closeButton}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={17} tintColor={c.text} />
              </Pressable>
            </View>
            {saveError ? <View style={s.errorBox}><Text style={s.errorText}>{saveError}</Text></View> : null}
            <Input label="Name" value={name} onChangeText={setName} maxLength={80} autoCapitalize="words" />
            <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={30} />
            <Button title="Save changes" fullWidth loading={saving} onPress={() => void saveProfile()} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
