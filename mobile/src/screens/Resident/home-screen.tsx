import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Badge from '@/components/badge';
import Button from '@/components/button';
import Card from '@/components/card';
import { sampleAnnouncement, sampleDues } from '@/constants/sample-data';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
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

export default function HomeScreen() {
  const router = useRouter();
  const c = useAppTheme();
  const s = getHomeStyles(c);
  const { user } = useAuth();

  const greeting = getGreeting(user?.name);
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const quickActions: QuickAction[] = [
    {
      id: 'dues',
      label: 'Dues',
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
      id: 'vehicles',
      label: 'Vehicles',
      icon: { ios: 'car.fill', android: 'directions_car', web: 'directions_car' },
    },
    {
      id: 'senior-help',
      label: 'Senior help',
      icon: { ios: 'heart.fill', android: 'volunteer_activism', web: 'volunteer_activism' },
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: { ios: 'megaphone.fill', android: 'campaign', web: 'campaign' },
    },
  ];

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
              style={({ pressed }) => [s.bellButton, pressed && s.bellButtonPressed]}>
              <SymbolView
                name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
                size={22}
                tintColor={c.textInverse}
              />
            </Pressable>
          </View>

          <View style={s.greetingBlock}>
            <Text style={s.greetingText}>{greeting}</Text>
            <Text style={s.dateText}>{today}</Text>
          </View>
        </View>

        <View style={s.body}>
          {/* 2. Monthly dues */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Your account</Text>
            <Text style={s.sectionHeading}>Monthly dues</Text>

            <Card style={s.duesCard}>
              <View style={s.duesHeaderRow}>
                <Text style={s.duesMonth}>{sampleDues.month}</Text>
                <Badge label={sampleDues.status} variant="warning" />
              </View>

              <Text style={s.duesAmount}>{sampleDues.amount}</Text>
              <Text style={s.duesDueDate}>{sampleDues.dueDate}</Text>

              <Button
                title="View dues"
                fullWidth
                onPress={() => router.push('/dues')}
              />
            </Card>
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

            <Card style={s.announcementCard}>
              <Text style={s.announcementTitle}>{sampleAnnouncement.title}</Text>
              <Text style={s.announcementDate}>{sampleAnnouncement.date}</Text>
              <Text numberOfLines={2} style={s.announcementPreview}>
                {sampleAnnouncement.preview}
              </Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
