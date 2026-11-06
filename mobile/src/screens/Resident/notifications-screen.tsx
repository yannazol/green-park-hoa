import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Card from '@/components/card';
import { api } from '@/services/api';
import { useAppTheme } from '@/hooks/use-app-theme';
import getNotificationStyles from '@/styles/notification-styles';

type ResidentNotification = {
  _id: string;
  type: 'concern' | 'payment' | 'reservation' | 'announcement' | 'service';
  title: string;
  message: string;
  path: string;
  targetId?: string | null;
  readAt?: string | null;
  createdAt: string;
};

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  }).format(new Date(value));

export default function NotificationsScreen() {
  const c = useAppTheme();
  const s = getNotificationStyles(c);
  const router = useRouter();
  const [notifications, setNotifications] = useState<ResidentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api<{ notifications: ResidentNotification[]; unreadCount: number }>(
        '/notifications/mine',
      );
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const openNotification = async (item: ResidentNotification) => {
    if (!item.readAt) {
      try {
        await api(`/notifications/mine/${item._id}/read`, { method: 'PATCH' });
        setNotifications((current) =>
          current.map((notification) =>
            notification._id === item._id
              ? { ...notification, readAt: new Date().toISOString() }
              : notification,
          ),
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch (markError) {
        setError(markError instanceof Error ? markError.message : 'Could not mark notification read.');
        return;
      }
    }

    switch (item.path) {
      case '/concerns':
        router.push('/concerns');
        break;
      case '/dues':
        router.push('/dues');
        break;
      case '/bookings':
        router.push('/bookings');
        break;
      case '/announcements':
        router.push('/announcements');
        break;
      default:
        router.push('/services');
    }
  };

  const markAllRead = async () => {
    setSaving(true);
    setError('');
    try {
      await api('/notifications/mine/read-all', { method: 'PATCH' });
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          readAt: notification.readAt ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Could not update notifications.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.page} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerText}>
            <Text style={s.title}>Notifications</Text>
            <Text style={s.subtitle}>
              {unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'You are all caught up.'}
            </Text>
          </View>
          {unreadCount > 0 ? (
            <Button title="Mark all read" variant="outline" loading={saving} onPress={() => void markAllRead()} />
          ) : null}
        </View>

        {error ? (
          <Card style={s.emptyCard}>
            <Text style={s.errorText}>{error}</Text>
            <Button title="Try again" variant="outline" onPress={() => void load()} />
          </Card>
        ) : loading ? (
          <Card style={s.emptyCard}>
            <Text style={s.emptyText}>Loading notifications…</Text>
          </Card>
        ) : notifications.length === 0 ? (
          <Card style={s.emptyCard}>
            <Text style={s.emptyTitle}>No notifications yet</Text>
            <Text style={s.emptyText}>HOA updates about your requests and account will appear here.</Text>
          </Card>
        ) : (
          <View style={s.list}>
            {notifications.map((item) => (
              <Pressable key={item._id} accessibilityRole="button" onPress={() => void openNotification(item)}>
                <Card style={[s.card, !item.readAt && s.unreadCard]}>
                  <View style={s.titleRow}>
                    <View style={s.titleGroup}>
                      {!item.readAt ? <View style={s.unreadDot} /> : null}
                      <Text style={s.cardTitle}>{item.title}</Text>
                    </View>
                    <Text style={s.category}>{item.type}</Text>
                  </View>
                  <Text style={s.message}>{item.message}</Text>
                  <Text style={s.date}>{dateLabel(item.createdAt)}</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
