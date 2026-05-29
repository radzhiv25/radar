import type { DelhiArea } from '@/types/database';
import type { FeedItem } from '@/types/feed';

export const POI_SAVE_PREFIX = 'poi:';

export type SavedLocalPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  placeId: string;
  savedAt: string;
};

export function makePoiSaveId(placeId: string): string {
  return `${POI_SAVE_PREFIX}${placeId}`;
}

export function isPoiSaveId(id: string): boolean {
  return id.startsWith(POI_SAVE_PREFIX);
}

export function localPlaceToMapRow(place: SavedLocalPlace) {
  return {
    id: place.id,
    name: place.name,
    slug: place.placeId,
    cuisine: 'Map place',
    price_band: 2,
    area: 'south' as DelhiArea,
    neighbourhood: 'Delhi',
    lat: place.lat,
    lng: place.lng,
    avg_rating: 0,
    is_editors_pick: false,
  };
}

export function localPlaceToFeedItem(place: SavedLocalPlace): FeedItem {
  const row = localPlaceToMapRow(place);
  return {
    ...row,
    description: null,
    image_urls: [],
    save_count: 0,
    restaurant_tags: [],
    score: 100,
    match_reason: 'Saved from map',
  };
}

export function poiClickToMapRow(name: string, placeId: string, lat: number, lng: number) {
  return localPlaceToMapRow({
    id: makePoiSaveId(placeId),
    name,
    lat,
    lng,
    placeId,
    savedAt: new Date().toISOString(),
  });
}
