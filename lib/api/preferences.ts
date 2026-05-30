import { loadLocalPreferences, saveLocalPreferences } from '@/lib/preferences/storage';
import { getSupabaseOptional } from '@/lib/supabase';
import type { UserPreferences } from '@/types/feed';

export async function fetchRemotePreferences(userId: string): Promise<UserPreferences | null> {
  const supabase = getSupabaseOptional();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('cuisines, budget_band, occasions, vibes, preferred_areas')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    cuisines: data.cuisines ?? [],
    budget_band: data.budget_band ?? null,
    occasions: data.occasions ?? [],
    vibes: data.vibes ?? [],
    preferred_areas: data.preferred_areas ?? [],
  };
}

export async function syncPreferencesToRemote(
  userId: string,
  prefs: UserPreferences
): Promise<boolean> {
  const supabase = getSupabaseOptional();
  if (!supabase) return false;

  const { error } = await supabase.from('user_preferences').upsert(
    {
      user_id: userId,
      cuisines: prefs.cuisines,
      budget_band: prefs.budget_band,
      occasions: prefs.occasions,
      vibes: prefs.vibes,
      preferred_areas: prefs.preferred_areas,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  return !error;
}

export async function savePreferences(prefs: UserPreferences, userId?: string | null): Promise<void> {
  await saveLocalPreferences(prefs);
  if (userId) {
    await syncPreferencesToRemote(userId, prefs);
  }
}

export async function mergeRemotePreferences(userId: string): Promise<UserPreferences> {
  const local = await loadLocalPreferences();
  const remote = await fetchRemotePreferences(userId);

  if (!remote) {
    await syncPreferencesToRemote(userId, local);
    return local;
  }

  const hasLocal =
    local.cuisines.length > 0 ||
    local.budget_band !== null ||
    local.occasions.length > 0 ||
    local.vibes.length > 0 ||
    local.preferred_areas.length > 0;

  if (hasLocal) {
    await syncPreferencesToRemote(userId, local);
    return local;
  }

  await saveLocalPreferences(remote);
  return remote;
}
