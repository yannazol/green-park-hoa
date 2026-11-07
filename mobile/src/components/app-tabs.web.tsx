import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet, type PressableProps } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="house">Home</TabButton>
          </TabTrigger>
          <TabTrigger name="concerns" href="/concerns" asChild>
            <TabButton icon="report_problem">Concerns</TabButton>
          </TabTrigger>
          <TabTrigger name="dues" href="/dues" asChild>
            <TabButton icon="payments">Payments</TabButton>
          </TabTrigger>
          <TabTrigger name="bookings" href="/bookings" asChild>
            <TabButton icon="event">Reservations</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon="person">Profile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = Pick<TabTriggerSlotProps, 'children' | 'isFocused' | 'onPress' | 'onLongPress'> &
  Pick<PressableProps, 'accessibilityLabel' | 'accessibilityHint' | 'testID'> & {
    icon: 'house' | 'report_problem' | 'payments' | 'event' | 'person';
  };

export function TabButton({ children, icon, isFocused, onPress, onLongPress, ...accessibilityProps }: TabButtonProps) {
  const c = useAppTheme();

  return (
    <Pressable
      {...accessibilityProps}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => pressed ? styles.pressed : undefined}>
      <View
        style={[
          styles.tabButtonView,
          { backgroundColor: isFocused ? c.brandLight : 'transparent' },
        ]}>
        <SymbolView
          name={{
            ios: icon === 'house' ? 'house' : icon === 'report_problem' ? 'exclamationmark.bubble' : icon === 'payments' ? 'creditcard' : icon === 'event' ? 'calendar' : 'person.crop.circle',
            android: icon,
            web: icon,
          }}
          size={18}
          tintColor={isFocused ? c.brand : c.textSecondary}
        />
        <ThemedText
          type="small"
          style={{ color: isFocused ? c.brand : c.textSecondary, fontWeight: isFocused ? '600' : '400' }}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          Green Park HOA
        </ThemedText>

        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    minHeight: 44,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
});
