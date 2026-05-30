import { router } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { loadAllLocalSaves, removeLocalSave, saveMapPoi } from '@/lib/api/localSaves';
import { loadSavedIds, persistSave } from '@/lib/api/saves';
import { getSupabaseOptional } from '@/lib/supabase';
import { isPoiSaveId, makePoiSaveId, type SavedLocalPlace } from '@/types/place';

type SavesContextValue = {
  savedIds: Set<string>;
  localPlaces: Record<string, SavedLocalPlace>;
  loading: boolean;
  isSaved: (restaurantId: string) => boolean;
  toggleSave: (restaurantId: string) => Promise<boolean>;
  toggleMapPoi: (input: { name: string; lat: number; lng: number; placeId: string }) => Promise<void>;
  refresh: () => Promise<void>;
};

const SavesContext = createContext<SavesContextValue | null>(null);

export function SavesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [localPlaces, setLocalPlaces] = useState<Record<string, SavedLocalPlace>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [{ places }, ids] = await Promise.all([loadAllLocalSaves(), loadSavedIds()]);
      setLocalPlaces(places);
      setSavedIds(ids);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isSaved = useCallback((restaurantId: string) => savedIds.has(restaurantId), [savedIds]);

  const requireAuthForCatalogSave = useCallback(async (): Promise<boolean> => {
    const supabase = getSupabaseOptional();
    if (!supabase) return true;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) return true;

    router.push('/(auth)/login');
    return false;
  }, []);

  const toggleSave = useCallback(
    async (restaurantId: string): Promise<boolean> => {
      if (!isPoiSaveId(restaurantId)) {
        const allowed = await requireAuthForCatalogSave();
        if (!allowed) return false;
      }

      const shouldSave = !savedIds.has(restaurantId);
      const next = await persistSave(restaurantId, shouldSave);
      setSavedIds(next);
      if (isPoiSaveId(restaurantId) && !shouldSave) {
        setLocalPlaces((prev) => {
          const copy = { ...prev };
          delete copy[restaurantId];
          return copy;
        });
      }
      return true;
    },
    [savedIds, requireAuthForCatalogSave]
  );

  const toggleMapPoi = useCallback(
    async (input: { name: string; lat: number; lng: number; placeId: string }) => {
      const id = makePoiSaveId(input.placeId);
      if (savedIds.has(id)) {
        const { ids, places } = await removeLocalSave(id);
        setSavedIds(ids);
        setLocalPlaces(places);
        return;
      }
      const { ids, places } = await saveMapPoi(input);
      setSavedIds(ids);
      setLocalPlaces(places);
    },
    [savedIds]
  );

  const value = useMemo(
    () => ({ savedIds, localPlaces, loading, isSaved, toggleSave, toggleMapPoi, refresh }),
    [savedIds, localPlaces, loading, isSaved, toggleSave, toggleMapPoi, refresh]
  );

  return <SavesContext.Provider value={value}>{children}</SavesContext.Provider>;
}

export function useSaves() {
  const ctx = useContext(SavesContext);
  if (!ctx) throw new Error('useSaves must be used within SavesProvider');
  return ctx;
}
