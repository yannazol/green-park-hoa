import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '@/components/badge';
import Button from '@/components/button';
import Card from '@/components/card';
import type { Announcement } from '@/constants/resident-options';
import { useAppTheme } from '@/hooks/use-app-theme';
import { api } from '@/services/api';
import getAnnouncementStyles from '@/styles/announcement-styles';

const CATEGORY_VARIANTS = {
  Notice: 'info',
  Maintenance: 'warning',
  Reminder: 'neutral',
  Fees: 'danger',
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  }).format(new Date(value));
}

export default function AnnouncementsScreen() {
  const c = useAppTheme();
  const s = getAnnouncementStyles(c);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [imageErrorId, setImageErrorId] = useState('');
  const [imageLoadingId, setImageLoadingId] = useState('');

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api<{ announcements: Announcement[] }>('/announcements');
      setAnnouncements(result.announcements ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load announcements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAnnouncements();
    }, [loadAnnouncements]),
  );

  const toggleExpanded = async (item: Announcement) => {
    const id = item._id;
    if (!expandedIds.has(id) && item.images?.some((image) => !image.data)) {
      setImageLoadingId(id);
      setImageError('');
      setImageErrorId('');
      try {
        const { announcement } = await api<{ announcement: Announcement }>(`/announcements/${id}`);
        setAnnouncements((current) =>
          current.map((entry) => (entry._id === id ? announcement : entry)),
        );
      } catch (loadError) {
        setImageError(loadError instanceof Error ? loadError.message : 'Could not load photos.');
        setImageErrorId(id);
        setImageLoadingId('');
        return;
      }
      setImageLoadingId('');
    }

    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView style={s.page} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Announcements</Text>
        <Text style={s.subtitle}>Updates and notices from your community.</Text>

        {loading ? (
          <Card style={s.emptyCard}>
            <Text style={s.emptyText}>Loading announcements...</Text>
          </Card>
        ) : error ? (
          <Card style={s.emptyCard}>
            <Text style={s.errorText}>{error}</Text>
            <Button title="Try again" variant="outline" onPress={() => void loadAnnouncements()} />
          </Card>
        ) : announcements.length === 0 ? (
          <Card style={s.emptyCard}>
            <Text style={s.emptyTitle}>No announcements yet</Text>
            <Text style={s.emptyText}>Published community updates will appear here.</Text>
          </Card>
        ) : (
          announcements.map((item) => {
            const expanded = expandedIds.has(item._id);
            return (
              <Card key={item._id} style={s.card}>
                <View style={s.metaRow}>
                  <Badge label={item.category} variant={CATEGORY_VARIANTS[item.category] ?? 'neutral'} />
                  <Text style={s.date}>{formatDate(item.publishedAt ?? item.date)}</Text>
                </View>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text numberOfLines={expanded ? undefined : 3} style={s.message}>
                  {item.message}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={expanded ? 'Show less' : 'Read more'}
                  onPress={() => void toggleExpanded(item)}
                  style={s.readMore}>
                  <Text style={s.readMoreText}>
                    {imageLoadingId === item._id ? 'Loading...' : expanded ? 'Show less' : 'Read more'}
                  </Text>
                </Pressable>
                {imageError && imageErrorId === item._id ? <Text style={s.errorText}>{imageError}</Text> : null}
                {item.images?.length ? (
                  <View style={s.images}>
                    {item.images.map((image, index) => (
                      <Image
                        key={`${item._id}-${index}`}
                        source={{ uri: `data:${image.mimeType};base64,${image.data}` }}
                        accessibilityLabel={image.name || `Announcement photo ${index + 1}`}
                        resizeMode="cover"
                        style={s.image}
                      />
                    ))}
                  </View>
                ) : null}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
