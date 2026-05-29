import Constants from 'expo-constants';

function readEnv(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;

  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  return extra?.[name];
}

export function getSupabaseUrl(): string | undefined {
  return readEnv('EXPO_PUBLIC_SUPABASE_URL');
}

export function getSupabaseAnonKey(): string | undefined {
  return readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
