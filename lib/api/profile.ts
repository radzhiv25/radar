import { getSupabaseOptional } from '@/lib/supabase';

export async function fetchStreakCount(userId: string): Promise<number> {
  const supabase = getSupabaseOptional();
  if (!supabase) return 0;

  const { data, error } = await supabase.rpc('get_streak_count', {
    p_user_id: userId,
  } as { p_user_id: string });

  if (error) return 0;
  return Number(data ?? 0);
}
