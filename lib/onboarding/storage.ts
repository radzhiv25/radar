import AsyncStorage from '@react-native-async-storage/async-storage';

import { hasChosenTaste } from '@/lib/preferences/storage';

const WELCOME_KEY = 'radar:has_seen_welcome';

export async function hasSeenWelcome(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(WELCOME_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function markWelcomeSeen(): Promise<void> {
  await AsyncStorage.setItem(WELCOME_KEY, 'true');
}

export async function shouldShowTasteGuide(): Promise<boolean> {
  const [seen, taste] = await Promise.all([hasSeenWelcome(), hasChosenTaste()]);
  return seen && !taste;
}
