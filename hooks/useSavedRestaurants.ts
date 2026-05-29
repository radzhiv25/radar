import { useCallback, useEffect, useState } from 'react';

import { useSaves } from '@/contexts/SavesContext';
import { fetchRestaurantsByIds } from '@/lib/api/restaurants';
import { isSupabaseConfigured } from '@/lib/env';
import { getGuide } from '@/lib/guides/content';
import { isPoiSaveId, localPlaceToMapRow } from '@/types/place';
import type { GuideContent } from '@/types/guide';
import type { RestaurantDetail } from '@/types/database';

function localPlaceToDetail(
  place: import('@/types/place').SavedLocalPlace
): RestaurantDetail {
  const row = localPlaceToMapRow(place);
  return {
    ...row,
    description: null,
    image_urls: [],
    save_count: 0,
  };
}

export function useSavedRestaurants() {
  const { savedIds, localPlaces } = useSaves();
  const [restaurants, setRestaurants] = useState<RestaurantDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState<GuideContent | null>(null);

  const savedKey = [...savedIds].sort().join(',');

  const refresh = useCallback(async () => {
    if (savedIds.size === 0) {
      setRestaurants([]);
      setGuide(getGuide('empty_saves'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setGuide(null);

    const mapSaved = Object.values(localPlaces)
      .filter((place) => savedIds.has(place.id))
      .map(localPlaceToDetail);

    const catalogIds = [...savedIds].filter((id) => !isPoiSaveId(id));
    let catalogSaved: RestaurantDetail[] = [];

    if (catalogIds.length > 0 && isSupabaseConfigured()) {
      catalogSaved = await fetchRestaurantsByIds(catalogIds);
    }

    const merged = [...mapSaved, ...catalogSaved];
    const order = new Map([...savedIds].map((id, i) => [id, i]));
    merged.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    if (merged.length === 0) {
      setGuide(getGuide('empty_saves'));
    }

    setRestaurants(merged);
    setLoading(false);
  }, [savedIds, localPlaces]);

  useEffect(() => {
    void refresh();
  }, [refresh, savedKey]);

  return { restaurants, loading, guide, refresh };
}
