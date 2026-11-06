import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '@/components/badge';
import Button from '@/components/button';
import Card from '@/components/card';
import type { Announcement } from '@/constants/resident-options';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { api } from '@/services/api';
import getHomeStyles from '@/styles/home-styles';

type QuickAction = {
  id: string;
  label: string;
  icon: {
    ios: 'creditcard.fill' | 'calendar' | 'exclamationmark.bubble.fill' | 'car.fill' | 'heart.fill' | 'megaphone.fill';
    android: 'payments' | 'event' | 'report_problem' | 'directions_car' | 'volunteer_activism' | 'campaign';
    web: 'payments' | 'event' | 'report_problem' | 'directions_car' | 'volunteer_activism' | 'campaign';
  };
  onPress?: () => void;
};

function getGreeting(name?: string) {
  const hour = new Date().getHours();
  let timeGreeting = 'Good evening';
  if (hour < 12) {
    timeGreeting = 'Good morning';
  } else if (hour < 18) {
    timeGreeting = 'Good afternoon';
  }
  const firstName = name?.trim().split(/\s+/)[0] || 'Resident';
  return `${timeGreeting}, ${firstName}`;
}

type HomeDues = {
  outstandingCentavos: number;
  creditCentavos: number;
  status: 'Paid' | 'Outstanding';
};
type HomeReservation = {
  _id: string;
  facilityName: string;
  date: string;
  timeSlot: string;
  status: string;
};
type HomeConcern = {
  _id: string;
  subject: string;
  status: string;
};

const money = (centavos: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(centavos / 100);

export default function HomeScreen() {
  const router = useRouter();
  const c = useAppTheme();
  const s = getHomeStyles(c);
  const { user } = useAuth();
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
  const [announcementError, setAnnouncementError] = useState('');
  const [dues, setDues] = useState<HomeDues | null>(null);
  const [reservations, setReservations] = useState<HomeReservation[]>([]);
  const [concerns, setConcerns] = useState<HomeConcern[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [homeError, setHomeError] = useState('');

  const greeting = getGreeting(user?.name);
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(new Date());

  const loadHome = useCallback(async () => {
    setLoading(true);
    setHomeError('');
    const results = await Promise.allSettled([
      api<HomeDues>('/dues/mine'),
      api<{ reservations: HomeReservation[] }>('/reservations/mine'),
      api<{ concerns: HomeConcern[] }>('/concerns/mine'),
      api<{ announcements: Announcement[] }>('/announcements'),
      api<{ unreadCount: number }>('/notifications/mine'),
    ]);
    const failures: string[] = [];
    if (results[0].status === 'fulfilled') setDues(results[0].value);
    else failures.push(results[0].reason instanceof Error ? results[0].reason.message : 'Could not load dues.');
    if (results[1].status === 'fulfilled') {
      setReservations(
        results[1].value.reservations.filter((item) => item.status === 'Pending' || item.status === 'Approved')
          .slice(0, 3),
      );
    } else failures.push(results[1].reason instanceof Error ? results[1].reason.message : 'Could not load reservations.');
    if (results[2].status === 'fulfilled') {
      setConcerns(
        results[2].value.concerns
          .filter((item) => !['resolved', 'rejected'].includes(item.status))
          .slice(0, 3),
      );
    } else failures.push(results[2].reason instanceof Error ? results[2].reason.message : 'Could not load concerns.');
    if (results[3].status === 'fulfilled') {
      setLatestAnnouncement(results[3].value.announcements[0] ?? null);
      setAnnouncementError('');
    } else {
      setLatestAnnouncement(null);
      setAnnouncementError(results[3].reason instanceof Error ? results[3].reason.message : 'Could not load announcements.');
    }
    if (results[4].status === 'fulfilled') setUnreadCount(results[4].value.unreadCount);
    if (failures.length) setHomeError('Some account information could not be refreshed.');
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHome();
    }, [loadHome]),
  );

  const quickActions: QuickAction[] = [
    {
      id: 'dues',
      label: 'Payments',
      icon: { ios: 'creditcard.fill', android: 'payments', web: 'payments' },
      onPress: () => router.push('/dues'),
    },
    {
      id: 'bookings',
      label: 'Book facility',
      icon: { ios: 'calendar', android: 'event', web: 'event' },
      onPress: () => router.push('/bookings'),
    },
    {
      id: 'concerns',
      label: 'Report issue',
      icon: { ios: 'exclamationmark.bubble.fill', android: 'report_problem', web: 'report_problem' },
      onPress: () => router.push('/concerns'),
    },
    {
      id: 'services',
      label: 'Community services',
      icon: { ios: 'car.fill', android: 'directions_car', web: 'directions_car' },
      onPress: () => router.push('/services'),
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: { ios: 'megaphone.fill', android: 'campaign', web: 'campaign' },
      onPress: () => router.push('/announcements'),
    },
  ];

  const formattedDate = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    return new Intl.DateTimeFormat('en-PH', {
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Manila',
    }).format(new Date(Date.UTC(year, month - 1, day)));
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView style={s.page} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* 1. Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <Text style={s.communityName}>Green Park Village HOA</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [s.bellButton, pressed && s.bellButtonPressed]}>
              <SymbolView
                name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
                size={22}
                tintColor={c.textInverse}
              />
              {unreadCount > 0 ? (
                <View style={s.notificationDot}>
                  <Text style={s.notificationDotText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>

          <View style={s.greetingBlock}>
            <Text style={s.greetingText}>{greeting}</Text>
            <Text style={s.dateText}>{today}</Text>
          </View>
        </View>

        <View style={s.body}>
          {homeError ? <Text style={s.announcementError}>{homeError}</Text> : null}
          {loading ? (
            <Card style={s.duesCard}>
              <ActivityIndicator color={c.brand} accessibilityLabel="Loading your community overview" />
              <Text style={s.announcementPreview}>Loading your community overview…</Text>
            </Card>
          ) : null}
          {/* 2. Monthly dues */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Your account</Text>
            <Text style={s.sectionHeading}>Outstanding dues</Text>

            <Card style={s.duesCard}>
              <View style={s.duesHeaderRow}>
                <Text style={s.duesMonth}>Account balance</Text>
                <Badge
                  label={dues?.status ?? 'Unavailable'}
                  variant={dues?.status === 'Paid' ? 'success' : dues ? 'warning' : 'neutral'}
                />
              </View>

              <Text style={s.duesAmount}>{dues ? money(dues.outstandingCentavos) : '—'}</Text>
              <Text style={s.duesDueDate}>
                {dues?.creditCentavos
                  ? `Available credit ${money(dues.creditCentavos)}`
                  : 'Current balance across posted billing periods'}
              </Text>

              <Button
                title="View dues"
                fullWidth
                onPress={() => router.push('/dues')}
              />
            </Card>
          </View>

          <View style={s.section}>
            <View style={s.sectionHeadingRow}>
              <Text style={s.sectionHeading}>Upcoming reservations</Text>
              <Pressable onPress={() => router.push('/bookings')} accessibilityRole="button">
                <Text style={s.sectionLink}>View all</Text>
              </Pressable>
            </View>
            {reservations.length ? reservations.map((reservation) => (
              <Card key={reservation._id} style={s.summaryCard}>
                <Text style={s.announcementTitle}>{reservation.facilityName}</Text>
                <Text style={s.announcementDate}>
                  {formattedDate(reservation.date)} · {reservation.timeSlot} · {reservation.status}
                </Text>
              </Card>
            )) : (
              <Card style={s.summaryCard}>
                <Text style={s.announcementPreview}>No upcoming reservation requests.</Text>
              </Card>
            )}
          </View>

          <View style={s.section}>
            <View style={s.sectionHeadingRow}>
              <Text style={s.sectionHeading}>Active concerns</Text>
              <Pressable onPress={() => router.push('/concerns')} accessibilityRole="button">
                <Text style={s.sectionLink}>View all</Text>
              </Pressable>
            </View>
            {concerns.length ? concerns.map((concern) => (
              <Card key={concern._id} style={s.summaryCard}>
                <Text style={s.announcementTitle}>{concern.subject}</Text>
                <Text style={s.announcementDate}>{concern.status.replaceAll('_', ' ')}</Text>
              </Card>
            )) : (
              <Card style={s.summaryCard}>
                <Text style={s.announcementPreview}>No open concerns.</Text>
              </Card>
            )}
          </View>

          {/* 3. Quick Actions */}
          <View style={s.section}>
            <Text style={s.sectionHeading}>What would you like to do?</Text>

            <View style={s.grid}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.id}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  onPress={action.onPress}
                  style={({ pressed }) => [s.tile, pressed && s.tilePressed]}>
                  <View style={s.tileIconBox}>
                    <SymbolView
                      name={action.icon}
                      size={22}
                      tintColor={c.brand}
                    />
                  </View>
                  <Text style={s.tileLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 4. Latest announcement */}
          <View style={s.section}>
            <Text style={s.sectionHeading}>Latest announcement</Text>

            {latestAnnouncement ? (
              <Pressable onPress={() => router.push('/announcements')} accessibilityRole="button">
                <Card style={s.announcementCard}>
                  <Text style={s.announcementTitle}>{latestAnnouncement.title}</Text>
                  <Text style={s.announcementDate}>
                    {new Intl.DateTimeFormat('en-PH', {
                      dateStyle: 'medium',
                      timeZone: 'Asia/Manila',
                    }).format(new Date(latestAnnouncement.publishedAt ?? latestAnnouncement.date))}
                  </Text>
                  <Text numberOfLines={2} style={s.announcementPreview}>
                    {latestAnnouncement.message}
                  </Text>
                </Card>
              </Pressable>
            ) : announcementError ? (
              <Card style={s.announcementCard}>
                <Text style={s.announcementError}>{announcementError}</Text>
              </Card>
            ) : (
              <Card style={s.announcementCard}>
                <Text style={s.announcementPreview}>No published announcements yet.</Text>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
