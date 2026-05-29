import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';

import { RestaurantFeedCard } from '@/components/feed/RestaurantFeedCard';
import { Screen } from '@/components/ui/Screen';
import { GuideState } from '@/components/ui/GuideState';
import { Text } from '@/components/ui/Text';
import { useSaves } from '@/contexts/SavesContext';
import { isPoiSaveId } from '@/types/place';
import { useSavedRestaurants } from '@/hooks/useSavedRestaurants';
import type { FeedItem } from '@/types/feed';

function toFeedItem(row: import('@/types/database').RestaurantDetail): FeedItem {
  return {
    ...row,
    restaurant_tags: [],
    score: 100,
    match_reason: 'Saved by you',
  };
}

export default function ProfileScreen() {
  const router = useRouter();
  const { savedIds, toggleSave, toggleMapPoi } = useSaves();
  const { restaurants, loading, guide, refresh } = useSavedRestaurants();

  return (
    <Screen>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        ListHeaderComponent={
          <View className="mb-4 gap-2">
            <Text variant="caption">Profile</Text>
            <Text variant="title" className="text-xl">
              Saved places
            </Text>
            <Text variant="body" className="text-sm">
              {savedIds.size > 0
                ? `${savedIds.size} saved · also on your home feed`
                : 'Your bookmarked restaurants live here'}
            </Text>
            <Pressable onPress={() => router.push('/(auth)/login')} className="mt-1">
              <Text variant="label" className="text-stone-500">
                Sign in to sync across devices
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator />
              <Text variant="body" className="mt-3 text-stone-500">
                Loading saves…
              </Text>
            </View>
          ) : guide ? (
            <GuideState
              guide={guide}
              onPrimaryPress={guide.key === 'connection_issue' ? refresh : undefined}
            />
          ) : null
        }
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item }) => (
          <View>
            <RestaurantFeedCard item={toFeedItem(item)} showSave={false} />
            <Pressable
              onPress={() => {
                if (isPoiSaveId(item.id)) {
                  void toggleMapPoi({
                    name: item.name,
                    lat: item.lat,
                    lng: item.lng,
                    placeId: item.slug,
                  });
                } else {
                  void toggleSave(item.id);
                }
              }}
              className="mt-2 self-start px-1">
              <Text variant="caption" className="normal-case tracking-normal text-stone-400">
                Remove from saved
              </Text>
            </Pressable>
          </View>
        )}
      />
    </Screen>
  );
}
