import { loadLocalPlaces, saveLocalPlaces } from '@/lib/preferences/localPlaces';
import { loadLocalSavedIds, saveLocalSavedIds } from '@/lib/preferences/storage';
import {
  isPoiSaveId,
  makePoiSaveId,
  type SavedLocalPlace,
} from '@/types/place';

export async function loadAllLocalSaves(): Promise<{
  ids: Set<string>;
  places: Record<string, SavedLocalPlace>;
}> {
  const [ids, places] = await Promise.all([loadLocalSavedIds(), loadLocalPlaces()]);

  for (const id of Object.keys(places)) {
    ids.add(id);
  }

  return { ids, places };
}

export async function saveMapPoi(input: {
  name: string;
  lat: number;
  lng: number;
  placeId: string;
}): Promise<{ ids: Set<string>; places: Record<string, SavedLocalPlace> }> {
  const id = makePoiSaveId(input.placeId);
  const place: SavedLocalPlace = {
    id,
    name: input.name,
    lat: input.lat,
    lng: input.lng,
    placeId: input.placeId,
    savedAt: new Date().toISOString(),
  };

  const places = await loadLocalPlaces();
  places[id] = place;
  await saveLocalPlaces(places);

  const ids = await loadLocalSavedIds();
  ids.add(id);
  await saveLocalSavedIds(ids);

  return { ids, places };
}

export async function removeLocalSave(id: string): Promise<{
  ids: Set<string>;
  places: Record<string, SavedLocalPlace>;
}> {
  const ids = await loadLocalSavedIds();
  ids.delete(id);

  const places = await loadLocalPlaces();
  if (isPoiSaveId(id)) {
    delete places[id];
    await saveLocalPlaces(places);
  }

  await saveLocalSavedIds(ids);
  return { ids, places };
}
