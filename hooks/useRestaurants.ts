import { useCallback, useEffect, useState } from 'react';

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
  refresh: () => Promise<void>;
  setQuery: (query: string) => void;
  setAreaFilter: (area: DelhiArea | null) => void;
  clearSearch: () => void;
};

export function useRestaurants(): UseRestaurantsResult {
  const [restaurants, setRestaurants] = useState<RestaurantMapRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<GuideContent | null>(null);
  const [query, setQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<DelhiArea | null>(null);

  const load = useCallback(async (searchQuery: string, area: DelhiArea | null) => {
    if (!isSupabaseConfigured()) {
      setGuide(getGuide('setup_connection'));
      setRestaurants([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setGuide(null);

    const { rows, failed } = await searchRestaurants(searchQuery, area);

    if (failed) {
      setGuide(getGuide('connection_issue'));
      setRestaurants([]);
      setLoading(false);
      return;
    }

    setRestaurants(rows);

    if (rows.length === 0) {
      if (searchQuery.trim() || area) {
        setGuide(getGuide('no_search_results'));
      } else {
        setGuide(getGuide('empty_map'));
      }
    } else {
      setGuide(null);
    }

    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    await load(query, areaFilter);
  }, [load, query, areaFilter]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setAreaFilter(null);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load(query, areaFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [load, query, areaFilter]);

  return {
    restaurants,
    loading,
    guide,
    query,
    areaFilter,
    refresh,
    setQuery,
    setAreaFilter,
    clearSearch,
  };
}
