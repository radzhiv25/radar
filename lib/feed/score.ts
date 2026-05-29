import type { FeedItem, FeedRestaurant, UserPreferences } from '@/types/feed';
import { EMPTY_PREFERENCES } from '@/types/feed';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function hasPreferences(prefs: UserPreferences): boolean {
  return (
    prefs.cuisines.length > 0 ||
    prefs.budget_band !== null ||
    prefs.occasions.length > 0 ||
    prefs.vibes.length > 0 ||
    prefs.preferred_areas.length > 0
  );
}

export function scoreRestaurant(
  restaurant: FeedRestaurant,
  options: {
    preferences?: UserPreferences;
    savedIds?: Set<string>;
    userLat?: number | null;
    userLng?: number | null;
  }
): FeedItem {
  const prefs = options.preferences ?? EMPTY_PREFERENCES;
  const hasPrefs = hasPreferences(prefs);
  const alreadySaved = options.savedIds?.has(restaurant.id) ?? false;

  const cuisinePts =
    hasPrefs && prefs.cuisines.includes(restaurant.cuisine)
      ? 3
      : !hasPrefs && restaurant.is_editors_pick
        ? 2
        : 0;

  const budgetPts =
    hasPrefs && prefs.budget_band !== null && restaurant.price_band === prefs.budget_band
      ? 2
      : !hasPrefs && restaurant.is_editors_pick
        ? 1
        : 0;

  const tagPts =
    restaurant.restaurant_tags.reduce((acc, rt) => {
      if (rt.tag_type === 'occasion' && prefs.occasions.includes(rt.tag)) return acc + 2;
      if (rt.tag_type === 'vibe' && prefs.vibes.includes(rt.tag)) return acc + 2;
      return acc;
    }, 0);

  const areaPts =
    hasPrefs && prefs.preferred_areas.includes(restaurant.area) ? 2 : 0;

  let proximityPts = 0;
  if (
    options.userLat != null &&
    options.userLng != null &&
    Number.isFinite(restaurant.lat) &&
    Number.isFinite(restaurant.lng)
  ) {
    const km = haversineKm(options.userLat, options.userLng, restaurant.lat, restaurant.lng);
    proximityPts = Math.max(0, 1 - km / 8);
  }

  const trendingPts = Math.min(restaurant.save_count, 10) * 0.03;
  const ratingPts = Number(restaurant.avg_rating) * 0.5;
  const savedPenalty = alreadySaved ? 5 : 0;

  const score =
    cuisinePts +
    budgetPts +
    tagPts +
    areaPts +
    proximityPts +
    trendingPts +
    ratingPts -
    savedPenalty;

  const reasons: string[] = [];
  if (cuisinePts > 0) reasons.push('Matches your cuisine picks');
  if (budgetPts > 0) reasons.push('Fits your budget');
  if (tagPts > 0) reasons.push('Matches your vibe or occasion');
  if (areaPts > 0) reasons.push('In your preferred area');
  if (proximityPts >= 0.5) reasons.push('Near you');
  if (!hasPrefs && restaurant.is_editors_pick) reasons.push("Editor's pick");
  if (!hasPrefs && restaurant.save_count > 0) reasons.push('Popular this week');

  const match_reason =
    reasons.length > 0 ? reasons.join(' · ') : 'Recommended for you';

  return {
    ...restaurant,
    score: Math.round(score * 100) / 100,
    match_reason,
  };
}

export function buildFeed(
  restaurants: FeedRestaurant[],
  options: Parameters<typeof scoreRestaurant>[1]
): FeedItem[] {
  return restaurants
    .map((r) => scoreRestaurant(r, options))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.save_count !== a.save_count) return b.save_count - a.save_count;
      return b.avg_rating - a.avg_rating;
    })
    .slice(0, 50);
}
