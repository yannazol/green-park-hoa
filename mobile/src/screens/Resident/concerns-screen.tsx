import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '@/components/badge';
import Button from '@/components/button';
import { STATUS_META, type Concern } from '@/constants/concerns';
import { useAppTheme } from '@/hooks/use-app-theme';
import NewConcernForm from '@/screens/Resident/new-concern-form';
import { api } from '@/services/api';
import getConcernsStyles from '@/styles/concerns-styles';

export default function ConcernsScreen() {
  const c = useAppTheme();
  const s = getConcernsStyles(c);

  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState<Concern | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await api<{ concerns: Concern[] }>('/concerns/mine');
      if (mounted.current) {
        setConcerns(data.concerns);
        setError('');
      }
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Reload every time the tab comes into view, so status updates show up
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const openConcern = async (concern: Concern) => {
    setSelectedConcern(concern);
    setDetailLoading(true);
    setDetailError('');
    try {
      const data = await api<{ concern: Concern }>(`/concerns/mine/${concern._id}`);
      setSelectedConcern(data.concern);
    } catch (detailFailure) {
      setDetailError(detailFailure instanceof Error ? detailFailure.message : 'Could not load concern details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedConcern(null);
    setDetailError('');
  };

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Concerns</Text>
        <Button title="New concern" style={s.newButton} onPress={() => setShowForm(true)} />
      </View>

      {loading ? (
        <View style={s.loadingState}>
          <ActivityIndicator color={c.primary} accessibilityLabel="Loading concerns" />
          <Text style={s.loadingText}>Loading concerns...</Text>
        </View>
      ) : (
        <FlatList
          data={concerns}
          keyExtractor={(item) => item._id}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
          }
          ListHeaderComponent={
            error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
                <Button
                  title="Try again"
                  variant="outline"
                  style={s.retryButton}
                  accessibilityLabel="Retry loading concerns"
                  onPress={onRefresh}
                />
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            error ? undefined : <Text style={s.empty}>You haven&apos;t submitted any concerns yet.</Text>
          }
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status];
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`View concern ${item.subject}`}
                onPress={() => void openConcern(item)}
                style={({ pressed }) => [s.card, pressed && s.cardPressed]}>
                <View style={s.cardTop}>
                  <Text style={s.subject}>{item.subject}</Text>
                  <Badge label={meta.label} variant={meta.variant} />
                </View>
                <Text style={s.meta}>
                  {item.type} · {item.category}
                </Text>
                <Text style={s.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                {item.staffNote ? (
                  <View style={s.noteBox}>
                    <Text style={s.noteLabel}>HOA note</Text>
                    <Text style={s.noteText}>{item.staffNote}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />
        )}
        <Modal
          visible={showForm}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowForm(false)}>
          <NewConcernForm
            onClose={() => setShowForm(false)}
            onCreated={() => {
              setShowForm(false);
              load();
            }}
          />
        </Modal>
        <Modal
          visible={selectedConcern !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeDetails}>
          <SafeAreaView style={s.detailPage}>
            <ScrollView contentContainerStyle={s.detailScroll} showsVerticalScrollIndicator={false}>
              <View style={s.detailHeader}>
                <View style={s.detailHeaderText}>
                  <Text style={s.detailTitle}>{selectedConcern?.subject ?? 'Concern details'}</Text>
                  {selectedConcern ? (
                    <Text style={s.meta}>
                      {selectedConcern.type} · {selectedConcern.category}
                    </Text>
                  ) : null}
                </View>
                <Button title="Close" variant="outline" onPress={closeDetails} />
              </View>
              {detailLoading ? (
                <ActivityIndicator color={c.brand} accessibilityLabel="Loading concern details" />
              ) : detailError ? (
                <View style={s.errorBox}><Text style={s.errorText}>{detailError}</Text></View>
              ) : selectedConcern ? (
                <>
                  <View style={s.detailStatusRow}>
                    <Badge
                      label={STATUS_META[selectedConcern.status].label}
                      variant={STATUS_META[selectedConcern.status].variant}
                    />
                    <Text style={s.date}>
                      Submitted {new Intl.DateTimeFormat('en-PH', {
                        dateStyle: 'medium',
                        timeZone: 'Asia/Manila',
                      }).format(new Date(selectedConcern.createdAt))}
                    </Text>
                  </View>
                  <View style={s.detailCard}>
                    <Text style={s.detailSectionTitle}>Description</Text>
                    <Text style={s.detailDescription}>{selectedConcern.description}</Text>
                  </View>
                  {selectedConcern.staffNote ? (
                    <View style={s.noteBox}>
                      <Text style={s.noteLabel}>HOA update</Text>
                      <Text style={s.noteText}>{selectedConcern.staffNote}</Text>
                    </View>
                  ) : null}
                  {selectedConcern.photos?.length ? (
                    <View style={s.detailCard}>
                      <Text style={s.detailSectionTitle}>Attachments</Text>
                      <View style={s.photoGrid}>
                        {selectedConcern.photos.map((uri, index) => (
                          <Image
                            key={`${selectedConcern._id}-${index}`}
                            source={{ uri }}
                            accessibilityLabel={`Concern attachment ${index + 1}`}
                            style={s.detailPhoto}
                          />
                        ))}
                      </View>
                    </View>
                  ) : null}
                  <View style={s.detailCard}>
                    <Text style={s.detailSectionTitle}>Progress</Text>
                    {(selectedConcern.statusHistory ?? []).map((entry, index) => (
                      <View key={`${entry.at}-${index}`} style={s.timelineRow}>
                        <View style={s.timelineDot} />
                        <View style={s.timelineBody}>
                          <Text style={s.timelineTitle}>{STATUS_META[entry.status]?.label ?? entry.status}</Text>
                          <Text style={s.date}>
                            {new Intl.DateTimeFormat('en-PH', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                              timeZone: 'Asia/Manila',
                            }).format(new Date(entry.at))}
                            {typeof entry.by === 'object' && entry.by?.name ? ` · ${entry.by.name}` : ''}
                          </Text>
                          {entry.note ? <Text style={s.noteText}>{entry.note}</Text> : null}
                        </View>
                      </View>
                    ))}
                    {(selectedConcern.statusHistory ?? []).length === 0 ? (
                      <Text style={s.date}>Your concern has been received.</Text>
                    ) : null}
                  </View>
                </>
              ) : null}
            </ScrollView>
          </SafeAreaView>
        </Modal>
    </SafeAreaView>
  );
}