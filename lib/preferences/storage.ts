import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserPreferences } from '@/types/feed';
import { EMPTY_PREFERENCES } from '@/types/feed';

const PREFS_KEY = 'radar:user_preferences';
const SAVED_KEY = 'radar:saved_restaurant_ids';

export async function loadLocalPreferences(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return EMPTY_PREFERENCES;
    return { ...EMPTY_PREFERENCES, ...JSON.parse(raw) } as UserPreferences;
  } catch {
    return EMPTY_PREFERENCES;
  }
}

export async function saveLocalPreferences(prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export async function hasChosenTaste(): Promise<boolean> {
  const prefs = await loadLocalPreferences();
  return (
    prefs.cuisines.length > 0 ||
    prefs.budget_band !== null ||
    prefs.occasions.length > 0 ||
    prefs.vibes.length > 0 ||
    prefs.preferred_areas.length > 0
  );
}

export async function loadLocalSavedIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

export async function toggleLocalSave(restaurantId: string): Promise<Set<string>> {
  const ids = await loadLocalSavedIds();
  if (ids.has(restaurantId)) ids.delete(restaurantId);
  else ids.add(restaurantId);
  return saveLocalSavedIds(ids);
}

export async function saveLocalSavedIds(ids: Set<string>): Promise<Set<string>> {
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify([...ids]));
  return ids;
}
