import { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/button';
import Input from '@/components/input';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import getLoginStyles from '@/styles/login-styles';

export default function LoginScreen() {
  const c = useAppTheme();
  const s = getLoginStyles(c);
  const { login, logout, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
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

  const handleSetPassword = async () => {
    setError('');
    setResetSuccess('');
    if (!email.trim() || !accessCode.trim() || !newPassword) {
      setError('Enter your email, access code, and new password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email.trim(), accessCode.trim(), newPassword);
      setAccessCode('');
      setNewPassword('');
      setSettingPassword(false);
      setResetSuccess('Password set. You can now sign in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordSetup = () => {
    setSettingPassword((current) => !current);
    setError('');
    setResetSuccess('');
  };

  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}>
          <View style={s.brand}>
            <Image
              source={require('../../../assets/images/full-hoa-seal.png')}
              style={s.brandLogo}
              resizeMode="contain"
              accessibilityLabel="Green Park Village Homeowners' Association seal"
            />
            <Text style={s.brandName}>Green Park Village HOA</Text>
            <Text style={s.tagline}>Resident app</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>
              {settingPassword ? 'Activate your account' : 'Welcome home'}
            </Text>
            <Text style={s.cardSubtitle}>
              {settingPassword
                ? 'Enter the one-time code provided by the HOA office.'
                : 'Sign in with your HOA resident account.'}
            </Text>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}
            {resetSuccess ? (
              <View style={s.successBox}>
                <Text style={s.successText}>{resetSuccess}</Text>
              </View>
            ) : null}

            <Input
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              style={s.authInput}
            />
            {settingPassword ? (
              <>
                <Input
                  label="One-time access code"
                  placeholder="XXXX-XXXX"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  value={accessCode}
                  onChangeText={setAccessCode}
                  style={s.authInput}
                />
                <Input
                  label="New password"
                  placeholder="At least 8 characters"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={s.authInputWithAdornment}
                  rightElement={
                    <Pressable
                      style={s.passwordToggle}
                      onPress={() => setShowPassword((current) => !current)}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      accessibilityRole="button"
                      accessibilityState={{ selected: showPassword }}
                    >
                      <SymbolView
                        name={{
                          ios: showPassword ? 'eye.slash' : 'eye',
                          android: showPassword ? 'visibility_off' : 'visibility',
                          web: showPassword ? 'visibility_off' : 'visibility',
                        }}
                        size={23}
                        tintColor={c.textSecondary}
                      />
                    </Pressable>
                  }
                />
                <Button
                  title="Activate account"
                  fullWidth
                  loading={submitting}
                  icon={{ ios: 'person.crop.circle.badge.checkmark', android: 'how_to_reg', web: 'how_to_reg' }}
                  style={s.primaryButton}
                  onPress={handleSetPassword}
                />
              </>
            ) : (
              <>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                  style={s.authInputWithAdornment}
                  rightElement={
                    <Pressable
                      style={s.passwordToggle}
                      onPress={() => setShowPassword((current) => !current)}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      accessibilityRole="button"
                      accessibilityState={{ selected: showPassword }}
                    >
                      <SymbolView
                        name={{
                          ios: showPassword ? 'eye.slash' : 'eye',
                          android: showPassword ? 'visibility_off' : 'visibility',
                          web: showPassword ? 'visibility_off' : 'visibility',
                        }}
                        size={23}
                        tintColor={c.textSecondary}
                      />
                    </Pressable>
                  }
                />
                <Button
                  title="Sign in"
                  fullWidth
                  loading={submitting}
                  icon={{ ios: 'rectangle.portrait.and.arrow.right', android: 'login', web: 'login' }}
                  style={s.primaryButton}
                  onPress={handleSubmit}
                />
              </>
            )}
            <Pressable
              onPress={togglePasswordSetup}
              accessibilityRole="button"
              style={s.setupLink}
            >
              <Text style={s.setupLinkText}>
                {settingPassword ? 'Back to sign in' : 'Have an HOA access code? Activate your account'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}