import * as Location from 'expo-location';

import { makePoiSaveId, poiClickToMapRow } from '@/types/place';

export function normalizePlaceId(
  placeId: string | undefined | null,
  lat: number,
  lng: number
): string {
  const trimmed = placeId?.trim();
  if (trimmed) return trimmed;
  return `${lat.toFixed(5)}_${lng.toFixed(5)}`;
}

export function placeNameFromGeocode(
  hit: Location.LocationGeocodedAddress | undefined,
  fallback = 'Selected spot'
): string {
  if (!hit) return fallback;
  return (
    hit.name ||
    hit.street ||
    hit.district ||
    hit.subregion ||
    hit.city ||
    hit.region ||
    fallback
  );
}

export async function resolvePlaceName(lat: number, lng: number): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    return placeNameFromGeocode(results[0]);
  } catch {
    return 'Selected spot';
  }
}

export function mapRowFromMapSelection(input: {
  name: string;
  placeId?: string | null;
  lat: number;
  lng: number;
}) {
  const placeId = normalizePlaceId(input.placeId, input.lat, input.lng);
  const name = input.name.trim() || 'Selected spot';
  return poiClickToMapRow(name, placeId, input.lat, input.lng);
}

export function mapRowFromPoiClick(
  name: string,
  placeId: string | undefined | null,
  lat: number,
  lng: number
) {
  return mapRowFromMapSelection({ name: name.trim() || 'Selected place', placeId, lat, lng });
}

export function isSamePoiPlace(
  a: { placeId: string; lat: number; lng: number },
  b: { placeId: string; lat: number; lng: number }
): boolean {
  if (a.placeId && b.placeId && a.placeId === b.placeId) return true;
  return (
    Math.abs(a.lat - b.lat) < 0.0001 &&
    Math.abs(a.lng - b.lng) < 0.0001
  );
}

export function poiMarkerId(placeId: string): string {
  return makePoiSaveId(placeId);
}
