import * as Location from 'expo-location';

import { DELHI_LAT, DELHI_LNG } from '@/lib/constants/map';
import { buildFeed, scoreRestaurant } from '@/lib/feed/score';
import { isSupabaseConfigured } from '@/lib/env';
import { loadLocalPreferences } from '@/lib/preferences/storage';
import { getSupabaseOptional } from '@/lib/supabase';
import type { GuideKey } from '@/types/guide';
import type { FeedItem, FeedRestaurant } from '@/types/feed';

const DELHI_LOCATION = { lat: DELHI_LAT, lng: DELHI_LNG };

type FeedLocation = {
  lat: number;
  lng: number;
};

async function resolveLocation(): Promise<FeedLocation> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return DELHI_LOCATION;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return DELHI_LOCATION;
  }
}

async function fetchRestaurantsWithTags(): Promise<{
  restaurants: FeedRestaurant[];
  failed: boolean;
}> {
  const supabase = getSupabaseOptional();
  if (!supabase) return { restaurants: [], failed: false };

  const { data, error } = await supabase
    .from('restaurants')
    .select(
      `
      id, name, slug, cuisine, price_band, area, neighbourhood,
      lat, lng, description, image_urls, avg_rating, save_count, is_editors_pick,
      restaurant_tags (tag_type, tag)
    `
    )
    .order('name');

  if (error) return { restaurants: [], failed: true };
  return { restaurants: (data ?? []) as FeedRestaurant[], failed: false };
}

async function fetchAuthenticatedFeed(
  userId: string,
  location: FeedLocation
): Promise<FeedItem[] | null> {
  const supabase = getSupabaseOptional();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc('get_feed', {
    p_user_id: userId,
    p_lat: location.lat,
    p_lng: location.lng,
  } as {
    p_user_id: string;
    p_lat: number;
    p_lng: number;
  });

  if (error) return null;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    cuisine: row.cuisine as string,
    price_band: row.price_band as number,
    area: row.area as FeedRestaurant['area'],
    neighbourhood: row.neighbourhood as string,
    lat: row.lat as number,
    lng: row.lng as number,
    description: (row.description as string | null) ?? null,
    image_urls: (row.image_urls as string[]) ?? [],
    avg_rating: Number(row.avg_rating ?? 0),
    save_count: Number(row.save_count ?? 0),
    is_editors_pick: Boolean(row.is_editors_pick),
    restaurant_tags: [],
    score: Number(row.score ?? 0),
    match_reason: (row.match_reason as string) || 'Recommended for you',
  }));
}

function buildSavedSection(
  restaurants: FeedRestaurant[],
  savedIds: Set<string>,
  options: Parameters<typeof scoreRestaurant>[1]
): FeedItem[] {
  return restaurants
    .filter((r) => savedIds.has(r.id))
    .map((r) => {
      const scored = scoreRestaurant(r, options);
      return {
        ...scored,
        score: 100,
        match_reason: 'Saved by you',
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchPersonalisedFeed(savedIds: Set<string>): Promise<{
  savedItems: FeedItem[];
  feedItems: FeedItem[];
  catalogCount: number;
  guideKey: GuideKey | null;
}> {
  if (!isSupabaseConfigured()) {
    const hasLocalSaves = savedIds.size > 0;
    return {
      savedItems: [],
      feedItems: [],
      catalogCount: 0,
      guideKey: hasLocalSaves ? null : 'setup_connection',
    };
  }

  const [location, prefs] = await Promise.all([resolveLocation(), loadLocalPreferences()]);

  const scoringOptions = {
    preferences: prefs,
    savedIds,
    userLat: location.lat,
    userLng: location.lng,
  };

  const { restaurants, failed } = await fetchRestaurantsWithTags();

  if (failed) {
    return {
      savedItems: [],
      feedItems: [],
      catalogCount: 0,
      guideKey: 'connection_issue',
    };
  }

  if (restaurants.length === 0) {
    return {
      savedItems: [],
      feedItems: [],
      catalogCount: 0,
      guideKey: 'empty_catalog',
    };
  }

  const savedItems = buildSavedSection(restaurants, savedIds, scoringOptions);

  const supabase = getSupabaseOptional();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;

  if (session?.user) {
    const rpcFeed = await fetchAuthenticatedFeed(session.user.id, location);
    if (rpcFeed && rpcFeed.length > 0) {
      const forYou = rpcFeed.filter((item) => !savedIds.has(item.id));
      return {
        savedItems,
        feedItems: forYou,
        catalogCount: restaurants.length,
        guideKey: savedItems.length === 0 && forYou.length === 0 ? 'empty_feed' : null,
      };
    }
  }

  const forYou = buildFeed(
    restaurants.filter((r) => !savedIds.has(r.id)),
    scoringOptions
  );

  const guideKey =
    savedItems.length === 0 && forYou.length === 0 ? 'empty_feed' : null;

  return {
    savedItems,
    feedItems: forYou,
    catalogCount: restaurants.length,
    guideKey,
  };
}
