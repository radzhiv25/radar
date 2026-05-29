import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SavedLocalPlace } from '@/types/place';

const LOCAL_PLACES_KEY = 'radar:local_saved_places';

export async function loadLocalPlaces(): Promise<Record<string, SavedLocalPlace>> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_PLACES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SavedLocalPlace>;
  } catch {
    return {};
  }
}

export async function saveLocalPlaces(places: Record<string, SavedLocalPlace>): Promise<void> {
  await AsyncStorage.setItem(LOCAL_PLACES_KEY, JSON.stringify(places));
}
