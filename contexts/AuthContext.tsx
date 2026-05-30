import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { mergeLocalSavesToRemote } from '@/lib/api/auth';
import { mergeRemotePreferences } from '@/lib/api/preferences';
import { getSupabaseOptional } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const supabase = getSupabaseOptional();
    if (!supabase) {
      setSession(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshSession();

    const supabase = getSupabaseOptional();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession);

      if (event === 'SIGNED_IN' && nextSession?.user) {
        await Promise.all([
          mergeLocalSavesToRemote(nextSession.user.id),
          mergeRemotePreferences(nextSession.user.id),
        ]);
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      refreshSession,
    }),
    [session, loading, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
