import { getSupabaseOptional } from '@/lib/supabase';
import type { Review } from '@/types/database';

export type UserReview = Review & {
  restaurant_id: string;
  restaurant_name: string;
  neighbourhood: string;
};

export async function upsertReview(input: {
  restaurantId: string;
  rating: number;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseOptional();
  if (!supabase) return { ok: false, error: 'Not configured' };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return { ok: false, error: 'Sign in required' };

  const { error } = await supabase.from('reviews').upsert(
    {
      user_id: session.user.id,
      restaurant_id: input.restaurantId,
      rating: input.rating,
      body: input.body.trim() || null,
    },
    { onConflict: 'user_id,restaurant_id' }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchUserReviews(userId: string): Promise<UserReview[]> {
  const supabase = getSupabaseOptional();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      id, rating, body, created_at, restaurant_id,
      restaurants ( name, neighbourhood )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const raw = row.restaurants as
      | { name: string; neighbourhood: string }
      | { name: string; neighbourhood: string }[]
      | null;
    const restaurant = Array.isArray(raw) ? raw[0] : raw;
    return {
      id: row.id as string,
      rating: row.rating as number,
      body: row.body as string | null,
      created_at: row.created_at as string,
      restaurant_id: row.restaurant_id as string,
      restaurant_name: restaurant?.name ?? 'Restaurant',
      neighbourhood: restaurant?.neighbourhood ?? '',
    };
  });
}

export async function fetchMyReviewForRestaurant(
  restaurantId: string
): Promise<{ rating: number; body: string | null } | null> {
  const supabase = getSupabaseOptional();
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const { data } = await supabase
    .from('reviews')
    .select('rating, body')
    .eq('user_id', session.user.id)
    .eq('restaurant_id', restaurantId)
    .maybeSingle();

  if (!data) return null;
  return { rating: data.rating, body: data.body };
}
