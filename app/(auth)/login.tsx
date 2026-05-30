import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, TextInput } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';
import { sendEmailOtp, signOut, verifyEmailOtp } from '@/lib/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/env';

export default function LoginScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSendCode = async () => {
    if (!email.trim()) {
      setError('Enter your email');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await sendEmailOtp(email);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not send code');
      return;
    }
    setStep('code');
  };

  const onVerify = async () => {
    if (!code.trim()) {
      setError('Enter the code from your email');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await verifyEmailOtp(email, code);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Invalid code');
      return;
    }
    router.replace('/(tabs)');
  };

  const onSignOut = async () => {
    setBusy(true);
    await signOut();
    setBusy(false);
    setStep('email');
    setCode('');
  };

  if (authLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator />
      </Screen>
    );
  }

  if (user) {
    return (
      <Screen className="justify-center px-6">
        <View className="gap-4">
          <Text variant="caption">Signed in</Text>
          <Text variant="title">You&apos;re in</Text>
          <Text variant="body">{user.email}</Text>
          <Button label="Continue to app" onPress={() => router.replace('/(tabs)')} />
          <Button label="Sign out" variant="ghost" onPress={onSignOut} disabled={busy} />
        </View>
      </Screen>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <Screen className="justify-center px-6">
        <View className="gap-3">
          <Text variant="title">Sign in</Text>
          <Text variant="body">
            Add Supabase env vars to enable sign-in and sync saves across devices.
          </Text>
          <Button label="Browse without signing in" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1">
      <Screen className="justify-center px-6">
        <View className="gap-4">
          <View className="gap-2">
            <Text variant="caption">Sign in</Text>
            <Text variant="title">Save & sync</Text>
            <Text variant="body" className="text-sm">
              Sign in to save restaurants, leave reviews, and track your streak. Works on iOS and
              Android.
            </Text>
          </View>

          {step === 'email' ? (
            <>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-base text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              />
              <Button
                label={busy ? 'Sending…' : 'Send login code'}
                onPress={onSendCode}
                disabled={busy}
              />
            </>
          ) : (
            <>
              <Text variant="body" className="text-sm text-stone-500">
                Code sent to {email}
              </Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="6-digit code"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-base text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              />
              <Button
                label={busy ? 'Verifying…' : 'Verify & continue'}
                onPress={onVerify}
                disabled={busy}
              />
              <Button label="Use a different email" variant="ghost" onPress={() => setStep('email')} />
            </>
          )}

          {error ? (
            <Text variant="body" className="text-sm text-red-600">
              {error}
            </Text>
          ) : null}

          <Button label="Not now" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
