import { getSupabaseOptional } from '@/lib/supabase';
import type {
  DelhiArea,
  RestaurantDetail,
  RestaurantFull,
  RestaurantMapRow,
  Review,
} from '@/types/database';

const MAP_COLUMNS =
  'id, name, slug, cuisine, price_band, area, neighbourhood, lat, lng, avg_rating, is_editors_pick';

const SAVED_LIST_COLUMNS = `${MAP_COLUMNS}, description, image_urls, save_count`;

export async function fetchRestaurantsForMap(): Promise<{
  rows: RestaurantMapRow[];
  failed: boolean;
}> {
  const supabase = getSupabaseOptional();
  if (!supabase) return { rows: [], failed: false };

  const { data, error } = await supabase.from('restaurants').select(MAP_COLUMNS).order('name');

  if (error) return { rows: [], failed: true };
  return { rows: (data ?? []) as RestaurantMapRow[], failed: false };
}

export async function fetchRestaurantsByIds(ids: string[]): Promise<RestaurantDetail[]> {
  if (ids.length === 0) return [];

  const supabase = getSupabaseOptional();
  if (!supabase) return [];

  const { data, error } = await supabase.from('restaurants').select(SAVED_LIST_COLUMNS).in('id', ids);

  if (error) return [];
  return (data ?? []) as RestaurantDetail[];
}

export async function fetchRestaurantFull(id: string): Promise<{
  restaurant: RestaurantFull | null;
  reviews: Review[];
  failed: boolean;
}> {
  if (id === 'demo') return { restaurant: null, reviews: [], failed: false };

  const supabase = getSupabaseOptional();
  if (!supabase) return { restaurant: null, reviews: [], failed: false };

  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select(
      `
      *,
      restaurant_tags (tag_type, tag)
    `
    )
    .eq('id', id)
    .maybeSingle();

  if (restaurantError) return { restaurant: null, reviews: [], failed: true };
  if (!restaurant) return { restaurant: null, reviews: [], failed: false };

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, rating, body, created_at')
    .eq('restaurant_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (reviewsError) return { restaurant: restaurant as RestaurantFull, reviews: [], failed: false };

  return {
    restaurant: restaurant as RestaurantFull,
    reviews: (reviews ?? []) as Review[],
    failed: false,
  };
}

function matchesQuery(row: RestaurantMapRow, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    row.name.toLowerCase().includes(lower) ||
    row.neighbourhood.toLowerCase().includes(lower) ||
    row.cuisine.toLowerCase().includes(lower) ||
    row.area.toLowerCase().includes(lower)
  );
}

export async function searchRestaurants(
  query: string,
  areaFilter?: DelhiArea | null
): Promise<{ rows: RestaurantMapRow[]; failed: boolean }> {
  const trimmed = query.trim();
  let rows: RestaurantMapRow[];

  if (!trimmed) {
    const result = await fetchRestaurantsForMap();
    rows = result.rows;
    if (result.failed) return { rows: [], failed: true };
  } else {
    const supabase = getSupabaseOptional();
    if (!supabase) {
      return { rows: [], failed: false };
    }

    const { data, error } = await supabase.rpc('search_restaurants', {
      p_query: trimmed,
    } as { p_query: string });

    if (error) {
      const all = await fetchRestaurantsForMap();
      if (all.failed) return { rows: [], failed: true };
      rows = all.rows.filter((r) => matchesQuery(r, trimmed));
    } else {
      const raw = (data ?? []) as RestaurantDetail[];
      rows = raw.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        cuisine: row.cuisine,
        price_band: row.price_band,
        area: row.area,
        neighbourhood: row.neighbourhood,
        lat: row.lat,
        lng: row.lng,
        avg_rating: row.avg_rating,
        is_editors_pick: row.is_editors_pick,
      }));
    }
  }

  if (areaFilter) {
    rows = rows.filter((r) => r.area === areaFilter);
  }

  return { rows, failed: false };
}
