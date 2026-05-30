import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';

import { Button } from '@/components/ui/Button';
import { GuideState } from '@/components/ui/GuideState';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';
import type { RestaurantMapRow } from '@/types/database';
import type { GuideContent } from '@/types/guide';

type MapFallbackListProps = {
  restaurants: RestaurantMapRow[];
  loading: boolean;
  guide: GuideContent | null;
  onRefresh: () => void;
  onClearSearch: () => void;
  savedIds: Set<string>;
  onToggleSave: (restaurantId: string) => Promise<boolean>;
};

export function MapFallbackList({
  restaurants,
  loading,
  guide,
  onRefresh,
  onClearSearch,
  savedIds,
  onToggleSave,
}: MapFallbackListProps) {
  const router = useRouter();

  const onGuidePrimary = () => {
    if (!guide) return;
    if (guide.key === 'connection_issue') void onRefresh();
    if (guide.key === 'no_search_results') onClearSearch();
  };

  if (loading && restaurants.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator />
        <Text variant="body" className="mt-3">
          Loading restaurants…
        </Text>
      </View>
    );
  }

  if (guide && restaurants.length === 0) {
    return (
      <View className="flex-1 justify-center bg-stone-50 px-4 dark:bg-stone-950">
        <GuideState guide={guide} onPrimaryPress={onGuidePrimary} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-stone-50 dark:bg-stone-950"
      contentContainerStyle={{ gap: 8, padding: 16, paddingBottom: 32 }}
      data={restaurants}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        guide ? (
          <GuideState guide={guide} compact onPrimaryPress={onGuidePrimary} />
        ) : (
          <Text variant="body" className="py-8 text-center">
            No matches. Try another search.
          </Text>
        )
      }
      renderItem={({ item }) => {
        const saved = savedIds.has(item.id);
        return (
          <View className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <Pressable onPress={() => router.push(`/restaurant/${item.id}`)}>
              <Text variant="label">{item.name}</Text>
            </Pressable>
            <Text variant="body" className="mt-1 text-stone-500">
              {item.cuisine} · {item.neighbourhood}
            </Text>
            <Button
              label={saved ? 'Saved · on your feed' : 'Save to feed'}
              className="mt-3"
              onPress={() => onToggleSave(item.id)}
            />
          </View>
        );
      }}
    />
  );
}
