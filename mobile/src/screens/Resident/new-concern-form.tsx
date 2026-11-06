import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import OptionPicker from '@/components/option-picker';
import {
  CATEGORY_OPTIONS,
  TYPE_OPTIONS,
  type ConcernCategory,
  type ConcernType,
} from '@/constants/concerns';
import { useAppTheme } from '@/hooks/use-app-theme';
import { api } from '@/services/api';
import getNewConcernStyles from '@/styles/new-concern-styles';

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function NewConcernForm({ onClose, onCreated }: Props) {
  const c = useAppTheme();
  const s = getNewConcernStyles(c);

  const [type, setType] = useState<ConcernType>('complaint');
  const [category, setCategory] = useState<ConcernCategory | ''>('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [pickingPhotos, setPickingPhotos] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleSubmit = async () => {
    setError('');

    if (!category) {
      setError('Please choose a category.');
      return;
    }
    if (!subject.trim() || !description.trim()) {
      setError('Please fill in the subject and description.');
      return;
    }
    if (subject.trim().length > 120 || description.trim().length > 2000) {
      setError('Subject or description is longer than allowed.');
      return;
    }

    setSubmitting(true);
    let created = false;
    try {
      await api('/concerns', {
        method: 'POST',
        body: {
          type,
          category,
          subject: subject.trim(),
          description: description.trim(),
          photos: photos.map((photo) => ({
            mimeType: photo.mimeType,
            data: photo.base64,
          })),
        },
      });
      created = true;
      if (mounted.current) onCreated();
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      if (!created && mounted.current) setSubmitting(false);
    }
  };

  const choosePhotos = async () => {
    setPickingPhotos(true);
    setError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 3 - photos.length,
        quality: 0.8,
        base64: true,
        exif: false,
      });
      if (result.canceled) return;
      const selected = result.assets ?? [];
      const invalid = selected.find(
        (photo) =>
          !photo.base64 ||
          !['image/jpeg', 'image/png', 'image/webp'].includes(photo.mimeType ?? '') ||
          (photo.fileSize ?? 0) > 1024 * 1024 ||
          photo.base64.length > Math.ceil((1024 * 1024 * 4) / 3),
      );
      if (invalid) {
        setError('Choose JPEG, PNG, or WebP photos that are each 1 MB or smaller.');
        return;
      }
      if (photos.length + selected.length > 3) {
        setError('Attach no more than 3 photos.');
        return;
      }
      setPhotos((current) => [...current, ...selected]);
    } catch (pickerError) {
      setError(pickerError instanceof Error ? pickerError.message : 'Could not open the photo library.');
    } finally {
      setPickingPhotos(false);
    }
  };

  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>New concern</Text>
          <Text style={s.subtitle}>Tell the HOA what needs attention</Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <OptionPicker label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
          <OptionPicker
            label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
          />

          <Input
            label="Subject"
            placeholder="Short title, e.g. Broken street light"
            maxLength={120}
            value={subject}
            onChangeText={setSubject}
          />
          <Input
            label="Description"
            placeholder="Describe what happened and where"
            multiline
            maxLength={2000}
            style={s.textArea}
            value={description}
            onChangeText={setDescription}
          />

          <View style={s.photoSection}>
            <Text style={s.photoLabel}>Photos · up to 3, 1 MB each</Text>
            {photos.map((photo, index) => (
              <View key={photo.assetId ?? photo.uri} style={s.photoRow}>
                <Image source={{ uri: photo.uri }} style={s.photoThumb} />
                <Text numberOfLines={1} style={s.photoName}>{photo.fileName ?? `Photo ${index + 1}`}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  onPress={() => setPhotos((current) => current.filter((_, position) => position !== index))}
                  style={s.removePhoto}>
                  <Text style={s.removePhotoText}>Remove</Text>
                </Pressable>
              </View>
            ))}
            <Button
              title={pickingPhotos ? 'Opening photos…' : 'Attach photos'}
              variant="outline"
              disabled={pickingPhotos || photos.length >= 3}
              onPress={() => void choosePhotos()}
            />
          </View>

          <View style={s.actions}>
            <Button title="Submit" fullWidth loading={submitting} onPress={handleSubmit} />
            <Button
              title="Cancel"
              variant="outline"
              fullWidth
              disabled={submitting}
              onPress={onClose}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
