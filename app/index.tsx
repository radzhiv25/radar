import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { RadarSplash } from '@/components/RadarSplash';
import { Screen } from '@/components/ui/Screen';
import { hasChosenTaste } from '@/lib/preferences/storage';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    void hasChosenTaste().then((chosen) => {
      setNeedsOnboarding(!chosen);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator />
      </Screen>
    );
  }

  if (needsOnboarding) {
    return <Redirect href="/(onboarding)/preferences" />;
  }

  return <Redirect href="/(tabs)" />;
}
