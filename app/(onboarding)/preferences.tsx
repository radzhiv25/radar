import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';
import { useAuth } from '@/contexts/AuthContext';
import { savePreferences } from '@/lib/api/preferences';
import { markWelcomeSeen } from '@/lib/onboarding/storage';
import { loadLocalPreferences } from '@/lib/preferences/storage';
import {
  ONBOARDING_OCCASIONS,
  ONBOARDING_VIBES,
  formatTagLabel,
} from '@/lib/constants/tags';
import type { DelhiArea } from '@/types/database';
import type { UserPreferences } from '@/types/feed';
import { EMPTY_PREFERENCES } from '@/types/feed';

const CUISINES = ['Modern Indian', 'North Indian', 'South Indian', 'Italian', 'Japanese', 'Cafe'];
const AREAS: DelhiArea[] = ['north', 'south', 'east', 'west'];

export default function PreferencesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences>(EMPTY_PREFERENCES);
  const [step, setStep] = useState(0);
  const totalSteps = 4;

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

  const toggleVibe = (vibe: string) => {
    setPrefs((p) => ({
      ...p,
      vibes: p.vibes.includes(vibe) ? p.vibes.filter((v) => v !== vibe) : [...p.vibes, vibe],
    }));
  };

  const toggleOccasion = (occasion: string) => {
    setPrefs((p) => ({
      ...p,
      occasions: p.occasions.includes(occasion)
        ? p.occasions.filter((o) => o !== occasion)
        : [...p.occasions, occasion],
    }));
  };

  const setBudget = (band: number) => {
    setPrefs((p) => ({
      ...p,
      budget_band: p.budget_band === band ? null : band,
    }));
  };

  const onSave = async () => {
    await savePreferences(prefs, user?.id ?? null);
    await markWelcomeSeen();
    router.replace('/(tabs)');
  };

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <ScrollView className="flex-1 bg-stone-50 dark:bg-stone-950">
      <View className="gap-6 p-6">
        <View className="gap-2">
          <Text variant="caption">Onboarding · step {step + 1} of {totalSteps}</Text>
          <View className="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <View className="h-full rounded-full bg-stone-800" style={{ width: `${progress}%` }} />
          </View>
          <Text variant="title">Your taste</Text>
          <Text variant="body" className="text-sm">
            Powers your personalised Delhi feed.
          </Text>
        </View>

        {step === 0 && (
          <View className="gap-2">
            <Text variant="label">Cuisines</Text>
            <View className="flex-row flex-wrap gap-2">
              {CUISINES.map((c) => (
                <Chip key={c} label={c} active={prefs.cuisines.includes(c)} onPress={() => toggleCuisine(c)} />
              ))}
            </View>
          </View>
        )}

        {step === 1 && (
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
                      : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900'
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
        )}

        {step === 2 && (
          <View className="gap-4">
            <View className="gap-2">
              <Text variant="label">Vibes</Text>
              <View className="flex-row flex-wrap gap-2">
                {ONBOARDING_VIBES.map((v) => (
                  <Chip
                    key={v}
                    label={formatTagLabel(v)}
                    active={prefs.vibes.includes(v)}
                    onPress={() => toggleVibe(v)}
                  />
                ))}
              </View>
            </View>
            <View className="gap-2">
              <Text variant="label">Occasions</Text>
              <View className="flex-row flex-wrap gap-2">
                {ONBOARDING_OCCASIONS.map((o) => (
                  <Chip
                    key={o}
                    label={formatTagLabel(o)}
                    active={prefs.occasions.includes(o)}
                    onPress={() => toggleOccasion(o)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View className="gap-2">
            <Text variant="label">Areas you explore</Text>
            <View className="flex-row flex-wrap gap-2">
              {AREAS.map((area) => (
                <Chip
                  key={area}
                  label={area}
                  active={prefs.preferred_areas.includes(area)}
                  onPress={() => toggleArea(area)}
                />
              ))}
            </View>
          </View>
        )}

        <View className="flex-row gap-3">
          {step > 0 ? (
            <Button label="Back" variant="ghost" onPress={() => setStep((s) => s - 1)} />
          ) : null}
          {step < totalSteps - 1 ? (
            <Button label="Next" onPress={() => setStep((s) => s + 1)} />
          ) : (
            <Button label="Save & see my feed" onPress={onSave} />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-3 py-2 capitalize ${
        active
          ? 'border-stone-800 bg-stone-800'
          : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900'
      }`}>
      <Text
        variant="label"
        className={active ? 'text-white' : 'text-stone-600 dark:text-stone-300'}>
        {label}
      </Text>
    </Pressable>
  );
}
