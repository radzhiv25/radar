import type { DelhiArea } from '@/types/database';

export type RestaurantTag = {
  tag_type: 'vibe' | 'occasion' | 'food';
  tag: string;
};

export type FeedRestaurant = {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  price_band: number;
  area: DelhiArea;
  neighbourhood: string;
  lat: number;
  lng: number;
  description: string | null;
  image_urls: string[];
  avg_rating: number;
  save_count: number;
  is_editors_pick: boolean;
  restaurant_tags: RestaurantTag[];
};

export type FeedItem = FeedRestaurant & {
  score: number;
  match_reason: string;
};

export type UserPreferences = {
  cuisines: string[];
  budget_band: number | null;
  occasions: string[];
  vibes: string[];
  preferred_areas: DelhiArea[];
};

export const EMPTY_PREFERENCES: UserPreferences = {
  cuisines: [],
  budget_band: null,
  occasions: [],
  vibes: [],
  preferred_areas: [],
};
