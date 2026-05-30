import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { RestaurantDetailView } from '@/components/restaurant/RestaurantDetailView';
import { Screen } from '@/components/ui/Screen';
import { GuideState } from '@/components/ui/GuideState';
import { fetchMyReviewForRestaurant, upsertReview } from '@/lib/api/reviews';
import { fetchRestaurantFull } from '@/lib/api/restaurants';
import { useAuth } from '@/contexts/AuthContext';
import { getGuide } from '@/lib/guides/content';
import { isSupabaseConfigured } from '@/lib/env';
import { useSaves } from '@/contexts/SavesContext';
import type { RestaurantFull, Review } from '@/types/database';
import type { GuideContent } from '@/types/guide';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSaves();
  const [restaurant, setRestaurant] = useState<RestaurantFull | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<{ rating: number; body: string | null } | null>(null);
  const [loading, setLoading] = useState(id !== 'demo');
  const [guide, setGuide] = useState<GuideContent | null>(null);

  const load = useCallback(async () => {
    if (id === 'demo' || !id) return;

    if (!isSupabaseConfigured()) {
      setGuide(getGuide('setup_connection'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setGuide(null);

    const result = await fetchRestaurantFull(id);

    if (result.failed) {
      setGuide(getGuide('connection_issue'));
      setRestaurant(null);
    } else if (!result.restaurant) {
      setGuide(getGuide('restaurant_unavailable'));
      setRestaurant(null);
    } else {
      setRestaurant(result.restaurant);
      setReviews(result.reviews);
      if (user) {
        const mine = await fetchMyReviewForRestaurant(id);
        setMyReview(mine);
      }
    }

    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (id === 'demo') {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} className="justify-center px-6">
        <GuideState guide={getGuide('restaurant_unavailable')} />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator />
      </Screen>
    );
  }

  if (guide || !restaurant) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} className="justify-center px-6">
        <GuideState guide={guide ?? getGuide('restaurant_unavailable')} onPrimaryPress={load} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <RestaurantDetailView
        restaurant={restaurant}
        reviews={reviews}
        isSaved={isSaved(restaurant.id)}
        onToggleSave={() => {
          void toggleSave(restaurant.id);
        }}
        canReview={Boolean(user)}
        myReview={myReview}
        onSubmitReview={async (rating, body) => {
          if (!user) {
            router.push('/(auth)/login');
            return { ok: false, error: 'Sign in required' };
          }
          const result = await upsertReview({
            restaurantId: restaurant.id,
            rating,
            body,
          });
          if (result.ok) void load();
          return result;
        }}
        onReviewPosted={load}
      />
    </Screen>
  );
}
