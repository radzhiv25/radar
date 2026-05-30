import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  TextInput,
  View as RNView,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';
import { useAuth } from '@/contexts/AuthContext';
import { useSaves } from '@/contexts/SavesContext';
import { searchRestaurants } from '@/lib/api/restaurants';
import { isSupabaseConfigured } from '@/lib/env';
import type { RestaurantMapRow } from '@/types/database';

export default function ShareScreen() {
  const router = useRouter();
  const { q: initialQuery } = useLocalSearchParams<{ q?: string }>();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSaves();
  const [query, setQuery] = useState(typeof initialQuery === 'string' ? initialQuery : '');
  const [results, setResults] = useState<RestaurantMapRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const runSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const { rows } = await searchRestaurants(text);
    setResults(rows.slice(0, 20));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialQuery && typeof initialQuery === 'string') {
      void runSearch(initialQuery);
    }
  }, [initialQuery, runSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void runSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const onSave = async (restaurantId: string) => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    await toggleSave(restaurantId);
    setSavedId(restaurantId);
  };

  if (!isSupabaseConfigured()) {
    return (
      <Screen className="justify-center px-6">
        <Text variant="body">Connect Supabase to search and save restaurants.</Text>
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom', 'left', 'right']}>
      <View className="gap-4 p-4">
        <View className="gap-1">
          <Text variant="caption">Share → save</Text>
          <Text variant="title">Find this place</Text>
          <Text variant="body" className="text-sm">
            Search Radar&apos;s Delhi catalog and save to your profile.
          </Text>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Restaurant or neighbourhood"
          autoFocus
          className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-base dark:border-stone-700 dark:bg-stone-900"
        />

        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              query.trim() ? (
                <Text variant="body" className="text-stone-500">
                  No matches — try a neighbourhood or cuisine.
                </Text>
              ) : (
                <Text variant="body" className="text-stone-500">
                  Paste a name from Instagram and search.
                </Text>
              )
            }
            renderItem={({ item }) => (
              <RNView className="mb-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                <Text variant="label">{item.name}</Text>
                <Text variant="body" className="text-sm text-stone-500">
                  {item.neighbourhood} · {item.cuisine}
                </Text>
                <View className="mt-2 flex-row gap-2">
                  <Button
                    label={isSaved(item.id) ? 'Saved' : 'Save'}
                    onPress={() => onSave(item.id)}
                  />
                  <Pressable onPress={() => router.push(`/restaurant/${item.id}`)} className="px-2 py-3">
                    <Text variant="label" className="text-stone-500">
                      View
                    </Text>
                  </Pressable>
                </View>
              </RNView>
            )}
          />
        )}

        {savedId ? (
          <Text variant="body" className="text-sm text-stone-600">
            Saved — find it on Home and Profile.
          </Text>
        ) : null}

        <Button label="Done" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
