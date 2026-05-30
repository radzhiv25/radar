import { useRouter } from 'expo-router';
import { Dimensions, FlatList, Image, Pressable, ScrollView, View as RNView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReviewForm } from '@/components/restaurant/ReviewForm';
import { TagChip } from '@/components/restaurant/TagChip';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { View } from '@/components/ui/View';
import type { RestaurantFull, Review } from '@/types/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RestaurantDetailViewProps = {
  restaurant: RestaurantFull;
  reviews: Review[];
  isSaved: boolean;
  onToggleSave: () => void;
  canReview?: boolean;
  myReview?: { rating: number; body: string | null } | null;
  onSubmitReview?: (rating: number, body: string) => Promise<{ ok: boolean; error?: string }>;
  onReviewPosted?: () => void;
};

export function RestaurantDetailView({
  restaurant,
  reviews,
  isSaved,
  onToggleSave,
  canReview = false,
  myReview = null,
  onSubmitReview,
  onReviewPosted,
}: RestaurantDetailViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const images = restaurant.image_urls?.length ? restaurant.image_urls : [];
  const tags = restaurant.restaurant_tags ?? [];

  return (
    <ScrollView className="flex-1 bg-stone-50 dark:bg-stone-950">
      <Pressable
        onPress={() => router.back()}
        style={{ position: 'absolute', top: insets.top + 8, left: 16, zIndex: 20 }}
        className="rounded-full border border-stone-200 bg-white/90 px-3 py-2">
        <Text variant="label" className="text-sm">
          ← Back
        </Text>
      </Pressable>

      {images.length > 0 ? (
        <FlatList
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={images}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ width: SCREEN_WIDTH, height: 240, backgroundColor: '#f5f5f4' }}
              resizeMode="cover"
            />
          )}
        />
      ) : (
        <RNView style={{ height: 160, backgroundColor: '#f5f5f4' }} className="items-center justify-center">
          <Text variant="body" className="text-stone-400">
            No photos yet
          </Text>
        </RNView>
      )}

      <View className="gap-4 px-5 py-5">
        <View className="gap-1">
          <Text variant="caption" className="normal-case tracking-normal">
            {restaurant.neighbourhood} · {restaurant.area} Delhi
          </Text>
          <Text variant="title">{restaurant.name}</Text>
          <Text variant="body">
            {restaurant.cuisine} · {'₹'.repeat(restaurant.price_band)}
            {restaurant.avg_rating > 0
              ? ` · ★ ${Number(restaurant.avg_rating).toFixed(1)}`
              : ''}
          </Text>
          {restaurant.is_editors_pick && (
            <Text variant="caption" className="normal-case tracking-normal">
              Editor&apos;s pick
            </Text>
          )}
        </View>

        <Button
          label={isSaved ? 'Saved to profile & feed' : 'Save restaurant'}
          onPress={onToggleSave}
        />

        {restaurant.description ? (
          <View className="gap-1">
            <Text variant="label">About</Text>
            <Text variant="body">{restaurant.description}</Text>
          </View>
        ) : null}

        {tags.length > 0 && (
          <View className="gap-2">
            <Text variant="label">Tags</Text>
            <View className="flex-row flex-wrap gap-2">
              {tags.map((t) => (
                <TagChip key={`${t.tag_type}-${t.tag}`} tagType={t.tag_type} tag={t.tag} />
              ))}
            </View>
          </View>
        )}

        <View className="gap-3">
          <Text variant="label">Reviews</Text>
          {canReview && onSubmitReview ? (
            <ReviewForm
              initialRating={myReview?.rating ?? 0}
              initialBody={myReview?.body ?? ''}
              onSubmit={async (rating, body) => {
                const result = await onSubmitReview(rating, body);
                if (result.ok) onReviewPosted?.();
                return result;
              }}
            />
          ) : null}
          {reviews.length === 0 ? (
            <Text variant="body" className="text-stone-500">
              No reviews yet. Be the first after you visit.
            </Text>
          ) : (
            reviews.map((review) => (
              <View
                key={review.id}
                className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
                <Text variant="label">★ {review.rating}/5</Text>
                {review.body ? (
                  <Text variant="body" className="mt-2">
                    {review.body}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>

      </View>
    </ScrollView>
  );
}
