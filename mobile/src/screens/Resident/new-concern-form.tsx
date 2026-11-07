import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import DropdownPicker from '@/components/dropdown-picker';
import Input from '@/components/input';
import ModalCloseButton from '@/components/modal-close-button';
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
  onContentHeightChange: (height: number) => void;
};

export default function NewConcernForm({ onClose, onCreated, onContentHeightChange }: Props) {
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
  const [activeDropdown, setActiveDropdown] = useState<'type' | 'category' | null>(null);
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
    <SafeAreaView style={s.page} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          onContentSizeChange={(_, height) => onContentHeightChange(height)}>
          <View style={s.formHeader}>
            <View style={s.formHeaderText}>
              <Text style={s.title}>New concern</Text>
              <Text style={s.subtitle}>Tell the HOA what needs attention</Text>
            </View>
            <ModalCloseButton accessibilityLabel="Close new concern" disabled={submitting} onPress={onClose} />
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <DropdownPicker
            label="Type of Concern"
            placeholder="Select a concern type"
            options={TYPE_OPTIONS}
            value={type}
            onChange={setType}
            expanded={activeDropdown === 'type'}
            onToggle={(expanded) => setActiveDropdown(expanded ? 'type' : null)}
          />
          <DropdownPicker
            label="Category"
            placeholder="Select a category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            expanded={activeDropdown === 'category'}
            onToggle={(expanded) => setActiveDropdown(expanded ? 'category' : null)}
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
            <Text style={s.photoLabel}>Attach photos</Text>
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={pickingPhotos ? 'Opening photo library' : 'Tap to upload photos'}
              disabled={pickingPhotos || photos.length >= 3}
              onPress={() => void choosePhotos()}
              style={({ pressed }) => [s.uploadBox, pressed && s.uploadBoxPressed]}>
              <SymbolView
                name={{ ios: 'icloud.and.arrow.up', android: 'cloud_upload', web: 'cloud_upload' }}
                size={24}
                tintColor={c.brand}
              />
              <Text style={s.uploadTitle}>
                {pickingPhotos ? 'Opening photos…' : photos.length ? 'Tap to add more photos' : 'Tap to upload photos'}
              </Text>
              <Text style={s.uploadHint}>JPG, PNG, or WebP · up to 3 photos, 1 MB each</Text>
            </Pressable>
          </View>

          <View style={s.actions}>
            <Button
              title="Submit"
              icon={{ ios: 'paperplane.fill', android: 'send', web: 'send' }}
              fullWidth
              style={s.submitButton}
              loading={submitting}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
