import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, RefreshControl, Text, View } from 'react-native';
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
            ) : null
          }
          ListEmptyComponent={
            error ? null : <Text style={s.empty}>You haven&apos;t submitted any concerns yet.</Text>
          }
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status];
            return (
              <View style={s.card}>
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
              </View>
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
    </SafeAreaView>
  );
}