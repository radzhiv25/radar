import { loadAllLocalSaves } from '@/lib/api/localSaves';
import { isPoiSaveId } from '@/types/place';
import { loadLocalSavedIds, saveLocalSavedIds } from '@/lib/preferences/storage';
import { loadLocalPlaces, saveLocalPlaces } from '@/lib/preferences/localPlaces';
import { getSupabaseOptional } from '@/lib/supabase';

export async function loadSavedIds(): Promise<Set<string>> {
  const { ids: local } = await loadAllLocalSaves();

  try {
    const supabase = getSupabaseOptional();
    if (!supabase) return local;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return local;

    const { data, error } = await supabase
      .from('saves')
      .select('restaurant_id')
      .eq('user_id', session.user.id);

    if (error || !data) return local;

    const remote = new Set(data.map((row) => row.restaurant_id as string));
    return new Set([...local, ...remote]);
  } catch {
    return local;
  }
}

export async function persistSave(restaurantId: string, shouldSave: boolean): Promise<Set<string>> {
  const ids = await loadLocalSavedIds();

  if (shouldSave) {
    ids.add(restaurantId);
  } else {
    ids.delete(restaurantId);
    if (isPoiSaveId(restaurantId)) {
      const places = await loadLocalPlaces();
      delete places[restaurantId];
      await saveLocalPlaces(places);
    }
  }

  await saveLocalSavedIds(ids);

  if (isPoiSaveId(restaurantId)) return ids;

  try {
    const supabase = getSupabaseOptional();
    if (!supabase) return ids;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return ids;

    if (shouldSave) {
      await supabase.from('saves').upsert(
        { user_id: session.user.id, restaurant_id: restaurantId },
        { onConflict: 'user_id,restaurant_id' }
      );
    } else {
      await supabase
        .from('saves')
        .delete()
        .eq('user_id', session.user.id)
        .eq('restaurant_id', restaurantId);
    }
  } catch {
    // Local save still applies when offline or unsigned
  }

  return ids;
}
