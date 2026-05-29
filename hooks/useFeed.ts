import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSaves } from '@/contexts/SavesContext';
import { fetchPersonalisedFeed } from '@/lib/api/feed';
import { getGuide } from '@/lib/guides/content';
import { hasSeenWelcome, shouldShowTasteGuide } from '@/lib/onboarding/storage';
import type { GuideContent } from '@/types/guide';
import { localPlaceToFeedItem } from '@/types/place';
import type { FeedItem } from '@/types/feed';

export function useFeed() {
  const { savedIds, localPlaces } = useSaves();
  const [savedItems, setSavedItems] = useState<FeedItem[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState<GuideContent | null>(null);

  const savedKey = useMemo(() => [...savedIds].sort().join(','), [savedIds]);

  const refresh = useCallback(async () => {
    setLoading(true);

    const result = await fetchPersonalisedFeed(savedIds);

    const mapSaved = Object.values(localPlaces)
      .filter((place) => savedIds.has(place.id))
      .map(localPlaceToFeedItem)
      .sort((a, b) => a.name.localeCompare(b.name));

    const catalogSaved = result.savedItems.filter(
      (item) => !mapSaved.some((local) => local.id === item.id)
    );

    setSavedItems([...mapSaved, ...catalogSaved]);
    setFeedItems(result.feedItems);

    if (result.guideKey) {
      setGuide(getGuide(result.guideKey));
      setLoading(false);
      return;
    }

    const [seen, tasteGuide] = await Promise.all([hasSeenWelcome(), shouldShowTasteGuide()]);

    if (!seen) {
      setGuide(getGuide('welcome'));
    } else if (tasteGuide) {
      setGuide(getGuide('choose_taste'));
    } else {
      setGuide(null);
    }

    setLoading(false);
  }, [savedIds, localPlaces]);

  useEffect(() => {
    void refresh();
  }, [refresh, savedKey]);

  const items = useMemo(() => [...savedItems, ...feedItems], [savedItems, feedItems]);

  return { items, savedItems, feedItems, loading, guide, refresh };
}
