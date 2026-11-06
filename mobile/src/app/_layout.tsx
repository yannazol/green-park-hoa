import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/auth-context';
import LoginScreen from '@/screens/Auth/login-screen';

SplashScreen.preventAutoHideAsync();

function RootContent() {
  const { user, loading } = useAuth();

  if (loading) return null;
  // Only residents get the app. Everyone else sees the login screen.
  if (!user || user.role !== 'resident') return <LoginScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="announcements" options={{ presentation: 'card' }} />
      <Stack.Screen name="services" options={{ presentation: 'card' }} />
      <Stack.Screen name="notifications" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <RootContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
