import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RadarSplash } from '@/components/RadarSplash';
import { AuthProvider } from '@/contexts/AuthContext';
import { SavesProvider } from '@/contexts/SavesContext';

import '../global.css';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

const SPLASH_MIN_MS = 2200;

function useDeepLinks() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      const parsed = Linking.parse(url);
      const path = parsed.path ?? '';
      const q = parsed.queryParams?.q ?? parsed.queryParams?.text;
      const query = typeof q === 'string' ? q : Array.isArray(q) ? q[0] : undefined;

      if (path === 'share' || path.startsWith('share')) {
        router.push(query ? { pathname: '/share', params: { q: query } } : '/share');
      }
    };

    void Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, [router]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [splashDone, setSplashDone] = useState(false);

  useDeepLinks();

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.warn('Font load issue:', error);
      void SplashScreen.hideAsync();
    }
  }, [error]);

  useEffect(() => {
    if (!loaded) return;

    const timer = setTimeout(() => {
      setSplashDone(true);
    }, SPLASH_MIN_MS);

    return () => clearTimeout(timer);
  }, [loaded]);

  useEffect(() => {
    if (splashDone) {
      void SplashScreen.hideAsync();
    }
  }, [splashDone]);

  const fontsReady = loaded || Boolean(error);

  if (!fontsReady || !splashDone) {
    return <RadarSplash />;
  }

  const headerBg = isDark ? '#0c0a09' : '#fafaf9';
  const headerTint = isDark ? '#e7e5e4' : '#44403c';

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SavesProvider>
          <Stack
        screenOptions={{
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: headerTint,
          headerTitleStyle: { fontWeight: '500', fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: isDark ? '#0c0a09' : '#fafaf9' },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Sign in', presentation: 'modal' }} />
        <Stack.Screen name="(onboarding)/preferences" options={{ title: 'Your taste' }} />
        <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="share" options={{ title: 'Save from share', presentation: 'modal' }} />
          </Stack>
        </SavesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
