import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useAppTheme } from '@/hooks/use-app-theme';

export default function AppTabs() {
  const c = useAppTheme();

  return (
    <NativeTabs
      backgroundColor={c.bg}
      indicatorColor={c.brand}
      tintColor={c.brand}
      labelStyle={{ selected: { color: c.brand } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md={{ default: 'home', selected: 'home' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="dues">
        <NativeTabs.Trigger.Label>Dues</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'creditcard', selected: 'creditcard.fill' }}
          md={{ default: 'payments', selected: 'payments' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="bookings">
        <NativeTabs.Trigger.Label>Bookings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar.badge.clock' }}
          md={{ default: 'event', selected: 'event' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="concerns">
        <NativeTabs.Trigger.Label>Concerns</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'exclamationmark.bubble', selected: 'exclamationmark.bubble.fill' }}
          md={{ default: 'report_problem', selected: 'report_problem' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md={{ default: 'person_outline', selected: 'person' }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
