import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import getLoginStyles from '@/styles/login-styles';

export default function LoginScreen() {
  const c = useAppTheme();
  const s = getLoginStyles(c);
  const { login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleSubmit = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    let residentSignedIn = false;
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'resident') {
        residentSignedIn = true;
      } else {
        await logout();
        if (mounted.current) {
          setError('HOA staff and admins use the web portal. This app is for residents.');
        }
      }
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      if (!residentSignedIn && mounted.current) setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.brand}>
            <Text style={s.brandName}>Green Park Village HOA</Text>
            <Text style={s.tagline}>Resident app</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Sign in</Text>
            <Text style={s.cardSubtitle}>Use your HOA account</Text>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              placeholder="Your password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
            />

            <Button title="Sign in" fullWidth loading={submitting} onPress={handleSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}