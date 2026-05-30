export const ONBOARDING_VIBES = [
  'cosy',
  'casual',
  'authentic',
  'moody',
  'scenic',
  'lively',
  'trendy',
  'romantic',
  'rooftop',
] as const;

export const ONBOARDING_OCCASIONS = [
  'brunch',
  'date-night',
  'casual-meetup',
  'celebration',
  'work-lunch',
  'drinks',
  'solo',
  'quick-bite',
] as const;

export const MAP_CUISINES = [
  'Modern Indian',
  'North Indian',
  'South Indian',
  'Italian',
  'Japanese',
  'Cafe',
  'Mughlai',
  'Pan Asian',
] as const;

export const MAP_TAG_FILTERS = [
  { label: 'Date night', tag: 'date-night', type: 'occasion' as const },
  { label: 'Brunch', tag: 'brunch', type: 'occasion' as const },
  { label: 'Cocktails', tag: 'cocktail-bar', type: 'food' as const },
  { label: 'Coffee', tag: 'coffee-speciality', type: 'food' as const },
  { label: 'Cosy', tag: 'cosy', type: 'vibe' as const },
  { label: 'Rooftop', tag: 'rooftop', type: 'vibe' as const },
] as const;

export function formatTagLabel(tag: string): string {
  return tag
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
