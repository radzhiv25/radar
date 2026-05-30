import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';

import { RestaurantFeedCard } from '@/components/feed/RestaurantFeedCard';
import { Screen } from '@/components/ui/Screen';
import { GuideState } from '@/components/ui/GuideState';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useSaves } from '@/contexts/SavesContext';
import { fetchStreakCount } from '@/lib/api/profile';
import { fetchUserReviews, type UserReview } from '@/lib/api/reviews';
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
  const { user } = useAuth();
  const { savedIds, toggleSave, toggleMapPoi } = useSaves();
  const { restaurants, loading, guide, refresh } = useSavedRestaurants();
  const [streak, setStreak] = useState(0);
  const [myReviews, setMyReviews] = useState<UserReview[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setStreak(0);
      setMyReviews([]);
      return;
    }
    setProfileLoading(true);
    const [count, reviews] = await Promise.all([
      fetchStreakCount(user.id),
      fetchUserReviews(user.id),
    ]);
    setStreak(count);
    setMyReviews(reviews);
    setProfileLoading(false);
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onRefresh = useCallback(async () => {
    await Promise.all([refresh(), loadProfile()]);
  }, [refresh, loadProfile]);

  return (
    <Screen>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={loading || profileLoading} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <View className="gap-2">
              <Text variant="caption">Profile</Text>
              <Text variant="title" className="text-xl">
                Your Radar
              </Text>
              {user ? (
                <Text variant="body" className="text-sm text-stone-500">
                  {user.email}
                </Text>
              ) : null}
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                <Text variant="caption">Saved</Text>
                <Text variant="title" className="text-2xl">
                  {savedIds.size}
                </Text>
              </View>
              <View className="flex-1 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                <Text variant="caption">Streak</Text>
                <Text variant="title" className="text-2xl">
                  {user ? `${streak}d` : '—'}
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-3">
              <Pressable onPress={() => router.push('/(onboarding)/preferences')}>
                <Text variant="label" className="text-stone-600">
                  Edit taste
                </Text>
              </Pressable>
              <Pressable onPress={() => router.push('/share')}>
                <Text variant="label" className="text-stone-600">
                  Save from share
                </Text>
              </Pressable>
              <Pressable onPress={() => router.push(user ? '/(auth)/login' : '/(auth)/login')}>
                <Text variant="label" className="text-stone-600">
                  {user ? 'Account' : 'Sign in to sync'}
                </Text>
              </Pressable>
            </View>

            {myReviews.length > 0 ? (
              <View className="gap-2">
                <Text variant="label">My reviews</Text>
                {myReviews.slice(0, 3).map((review) => (
                  <Pressable
                    key={review.id}
                    onPress={() => router.push(`/restaurant/${review.restaurant_id}`)}
                    className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
                    <Text variant="label">{review.restaurant_name}</Text>
                    <Text variant="body" className="text-sm">
                      ★ {review.rating}/5 · {review.neighbourhood}
                    </Text>
                    {review.body ? (
                      <Text variant="body" className="mt-1 text-sm text-stone-500" numberOfLines={2}>
                        {review.body}
                      </Text>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : null}

            <Text variant="label" className="mt-2 text-stone-500">
              Saved places
            </Text>
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
          ) : (
            <Text variant="body" className="text-stone-500">
              Save restaurants from your feed or map.
            </Text>
          )
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
