export type DelhiArea = 'north' | 'south' | 'east' | 'west';

export type TagType = 'vibe' | 'occasion' | 'food';

export type RestaurantTag = {
  tag_type: TagType;
  tag: string;
};

export type RestaurantMapRow = {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  price_band: number;
  area: DelhiArea;
  neighbourhood: string;
  lat: number;
  lng: number;
  avg_rating: number;
  is_editors_pick: boolean;
};

export type RestaurantDetail = RestaurantMapRow & {
  description: string | null;
  image_urls: string[];
  save_count: number;
};

export type RestaurantFull = RestaurantDetail & {
  restaurant_tags: RestaurantTag[];
};

export type Review = {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
};
