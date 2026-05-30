import { useCallback, useEffect, useState } from 'react';

import type { MapTagFilter } from '@/components/map/MapFilters';
import { searchRestaurants } from '@/lib/api/restaurants';
import { isSupabaseConfigured } from '@/lib/env';
import { getGuide } from '@/lib/guides/content';
import type { GuideContent } from '@/types/guide';
import type { DelhiArea, RestaurantMapRow } from '@/types/database';

type UseRestaurantsResult = {
  restaurants: RestaurantMapRow[];
  loading: boolean;
  guide: GuideContent | null;
  query: string;
  areaFilter: DelhiArea | null;
  cuisineFilter: string | null;
  tagFilter: MapTagFilter;
  refresh: () => Promise<void>;
  setQuery: (query: string) => void;
  setAreaFilter: (area: DelhiArea | null) => void;
  setCuisineFilter: (cuisine: string | null) => void;
  setTagFilter: (tag: MapTagFilter) => void;
  clearSearch: () => void;
};

export function useRestaurants(): UseRestaurantsResult {
  const [restaurants, setRestaurants] = useState<RestaurantMapRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<GuideContent | null>(null);
  const [query, setQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<DelhiArea | null>(null);
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<MapTagFilter>(null);

  const load = useCallback(
    async (
      searchQuery: string,
      area: DelhiArea | null,
      cuisine: string | null,
      tag: MapTagFilter
    ) => {
      if (!isSupabaseConfigured()) {
        setGuide(getGuide('setup_connection'));
        setRestaurants([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setGuide(null);

      const { rows, failed } = await searchRestaurants(searchQuery, area, cuisine, tag);

      if (failed) {
        setGuide(getGuide('connection_issue'));
        setRestaurants([]);
        setLoading(false);
        return;
      }

      setRestaurants(rows);

      if (rows.length === 0) {
        if (searchQuery.trim() || area || cuisine || tag) {
          setGuide(getGuide('no_search_results'));
        } else {
          setGuide(getGuide('empty_map'));
        }
      } else {
        setGuide(null);
      }

      setLoading(false);
    },
    []
  );

  const refresh = useCallback(async () => {
    await load(query, areaFilter, cuisineFilter, tagFilter);
  }, [load, query, areaFilter, cuisineFilter, tagFilter]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setAreaFilter(null);
    setCuisineFilter(null);
    setTagFilter(null);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load(query, areaFilter, cuisineFilter, tagFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [load, query, areaFilter, cuisineFilter, tagFilter]);

  return {
    restaurants,
    loading,
    guide,
    query,
    areaFilter,
    cuisineFilter,
    tagFilter,
    refresh,
    setQuery,
    setAreaFilter,
    setCuisineFilter,
    setTagFilter,
    clearSearch,
  };
}
