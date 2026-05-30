import { loadLocalSavedIds } from '@/lib/preferences/storage';
import { getSupabaseOptional } from '@/lib/supabase';

export async function sendEmailOtp(email: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseOptional();
  if (!supabase) return { ok: false, error: 'Supabase is not configured' };

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseOptional();
  if (!supabase) return { ok: false, error: 'Supabase is not configured' };

  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'email',
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseOptional();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function mergeLocalSavesToRemote(userId: string): Promise<void> {
  const supabase = getSupabaseOptional();
  if (!supabase) return;

  const localIds = await loadLocalSavedIds();
  const catalogIds = [...localIds].filter((id) => !id.startsWith('poi:'));

  if (catalogIds.length === 0) return;

  const rows = catalogIds.map((restaurantId) => ({
    user_id: userId,
    restaurant_id: restaurantId,
  }));

  await supabase.from('saves').upsert(rows, { onConflict: 'user_id,restaurant_id' });
}
