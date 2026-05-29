import type { GuideContent, GuideKey } from '@/types/guide';

export const GUIDES: Record<GuideKey, GuideContent> = {
  welcome: {
    key: 'welcome',
    title: 'Welcome to Radar',
    message: 'Discover Delhi restaurants curated for your taste. A quick setup takes under a minute.',
    steps: [
      'Choose what you like — cuisines, budget, areas',
      'Explore the map and save places you love',
      'Your home feed fills with saved spots and picks for you',
    ],
    primary: { label: 'Set your taste', href: '/(onboarding)/preferences' },
    secondary: { label: 'Explore the map', href: '/(tabs)/map' },
  },
  choose_taste: {
    key: 'choose_taste',
    title: 'Tell us what you like',
    message: 'Pick a few preferences so we can rank restaurants for you. You can change these anytime.',
    steps: [
      'Select cuisines you enjoy',
      'Choose a budget band and preferred areas',
    ],
    primary: { label: 'Choose preferences', href: '/(onboarding)/preferences' },
    secondary: { label: 'Skip for now', href: '/(tabs)/map' },
  },
  empty_catalog: {
    key: 'empty_catalog',
    title: 'Restaurants coming soon',
    message: 'The Delhi catalog is not loaded yet. You can still explore the map and save places once they appear.',
    steps: [
      'The map works — search will fill in as venues are added',
      'Pull down on Home to refresh when data is ready',
    ],
    primary: { label: 'Open map', href: '/(tabs)/map' },
    secondary: { label: 'Set your taste', href: '/(onboarding)/preferences' },
  },
  empty_feed: {
    key: 'empty_feed',
    title: 'Build your feed',
    message: 'Save restaurants from the map to see them here, or set your taste for personalised picks.',
    steps: [
      'Map → search a place → tap Save',
      'Saved spots always show at the top of Home',
    ],
    primary: { label: 'Discover on map', href: '/(tabs)/map' },
    secondary: { label: 'Set your taste', href: '/(onboarding)/preferences' },
  },
  empty_saves: {
    key: 'empty_saves',
    title: 'No saved places yet',
    message: 'When you save a restaurant, it appears here and on your home feed.',
    steps: ['Map → tap a pin → Save', 'Or save from any restaurant card'],
    primary: { label: 'Explore the map', href: '/(tabs)/map' },
    secondary: { label: 'Browse home feed', href: '/(tabs)' },
  },
  empty_map: {
    key: 'empty_map',
    title: 'Map is ready',
    message: 'Save places on this device from the map. Radar catalog pins appear when connected.',
    steps: [
      'Android: tap a business icon on the map, or press and hold anywhere',
      'iPhone: tap a map label, or press and hold anywhere',
      'Then tap Save to device — shows on Home and Profile',
    ],
    primary: { label: 'Set your taste', href: '/(onboarding)/preferences' },
    secondary: { label: 'Dismiss' },
  },
  no_search_results: {
    key: 'no_search_results',
    title: 'No matches',
    message: 'Try a different spelling, another neighbourhood, or clear the area filter.',
    steps: ['Search by area name: south, north, Hauz Khas, GK'],
    primary: { label: 'Clear search' },
  },
  connection_issue: {
    key: 'connection_issue',
    title: 'Catalog offline',
    message: 'Radar could not load the restaurant list. You can still tap places on the map and save them on this device.',
    steps: [
      'Android: tap a business on the map, or press and hold a spot',
      'iPhone: tap a map label, or press and hold a spot',
      'Tap Save to device on the card',
    ],
    primary: { label: 'Try again' },
    secondary: { label: 'Dismiss' },
  },
  setup_connection: {
    key: 'setup_connection',
    title: 'Almost ready',
    message: 'Radar is still connecting. If you are setting up the app, add your Supabase keys to continue.',
    steps: [
      'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY',
      'Restart the app after saving .env',
    ],
    primary: { label: 'Retry', href: '/(tabs)' },
    secondary: { label: 'Dismiss' },
  },
  restaurant_unavailable: {
    key: 'restaurant_unavailable',
    title: 'Restaurant not available',
    message: 'This place may have been removed or is not in the catalog yet.',
    steps: ['Go back and pick another spot on the map'],
    primary: { label: 'Back to map', href: '/(tabs)/map' },
    secondary: { label: 'Home feed', href: '/(tabs)' },
  },
};

export function getGuide(key: GuideKey): GuideContent {
  return GUIDES[key];
}
