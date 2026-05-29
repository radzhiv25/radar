import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';
import { markWelcomeSeen } from '@/lib/onboarding/storage';
import { loadLocalPreferences, saveLocalPreferences } from '@/lib/preferences/storage';
import type { DelhiArea } from '@/types/database';
import type { UserPreferences } from '@/types/feed';
import { EMPTY_PREFERENCES } from '@/types/feed';

const CUISINES = ['Modern Indian', 'North Indian', 'South Indian', 'Italian', 'Japanese', 'Cafe'];
const AREAS: DelhiArea[] = ['north', 'south', 'east', 'west'];

export default function PreferencesScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<UserPreferences>(EMPTY_PREFERENCES);

  useEffect(() => {
    void loadLocalPreferences().then(setPrefs);
  }, []);

  const toggleCuisine = (cuisine: string) => {
    setPrefs((p) => ({
      ...p,
      cuisines: p.cuisines.includes(cuisine)
        ? p.cuisines.filter((c) => c !== cuisine)
        : [...p.cuisines, cuisine],
    }));
  };

  const toggleArea = (area: DelhiArea) => {
    setPrefs((p) => ({
      ...p,
      preferred_areas: p.preferred_areas.includes(area)
        ? p.preferred_areas.filter((a) => a !== area)
        : [...p.preferred_areas, area],
    }));
  };

  const setBudget = (band: number) => {
    setPrefs((p) => ({
      ...p,
      budget_band: p.budget_band === band ? null : band,
    }));
  };

  const onSave = async () => {
    await saveLocalPreferences(prefs);
    await markWelcomeSeen();
    router.replace('/(tabs)');
  };

  return (
    <ScrollView className="flex-1 bg-stone-50 dark:bg-stone-950">
      <View className="gap-6 p-6">
        <View className="gap-2">
          <Text variant="caption">Onboarding</Text>
          <Text variant="title">Your taste</Text>
          <Text variant="body" className="text-sm">
            Used to rank your home feed. You can change this anytime.
          </Text>
        </View>

        <View className="gap-2">
          <Text variant="label">Cuisines</Text>
          <View className="flex-row flex-wrap gap-2">
            {CUISINES.map((c) => (
              <Pressable
                key={c}
                onPress={() => toggleCuisine(c)}
                className={`rounded-full border px-3 py-2 ${
                  prefs.cuisines.includes(c)
                    ? 'border-stone-800 bg-stone-800'
                    : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900'
                }`}>
                <Text
                  variant="label"
                  className={
                    prefs.cuisines.includes(c) ? 'text-white' : 'text-stone-600 dark:text-stone-300'
                  }>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text variant="label">Budget</Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4].map((band) => (
              <Pressable
                key={band}
                onPress={() => setBudget(band)}
                className={`rounded-lg border px-4 py-2 ${
                  prefs.budget_band === band
                    ? 'border-stone-800 bg-stone-800'
                    : 'border-stone-200 bg-white'
                }`}>
                <Text
                  variant="label"
                  className={prefs.budget_band === band ? 'text-white' : 'text-stone-600'}>
                  {'₹'.repeat(band)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text variant="label">Areas</Text>
          <View className="flex-row flex-wrap gap-2">
            {AREAS.map((area) => (
              <Pressable
                key={area}
                onPress={() => toggleArea(area)}
                className={`rounded-full border px-3 py-2 capitalize ${
                  prefs.preferred_areas.includes(area)
                    ? 'border-stone-800 bg-stone-800'
                    : 'border-stone-200 bg-white'
                }`}>
                <Text
                  variant="label"
                  className={
                    prefs.preferred_areas.includes(area)
                      ? 'text-white'
                      : 'text-stone-600'
                  }>
                  {area}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Button label="Save & see my feed" onPress={onSave} />
      </View>
    </ScrollView>
  );
}
