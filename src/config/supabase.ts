import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// LOCALSTORAGE-ONLY MODE: Set to true to disable Supabase and use localStorage only
// Set to false for production with real Supabase
export const isLocalStorageMode = false;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient<Database> | null = null;

// Mock Supabase client for localStorage mode
class MockSupabaseClient {
  from(_table: string) {
    return {
      select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }), data: [], error: null }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: `local-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, error: null }) }), error: null }),
      update: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: null }), error: null }) }),
      delete: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: null }), error: null }) }),
    };
  }
  
  channel(_name: string) {
    return {
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
      unsubscribe: () => {},
    };
  }
  
  auth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { session: null, user: null }, error: null }),
    signUp: () => Promise.resolve({ data: { session: null, user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  };
}

const mockClient = new MockSupabaseClient() as unknown as SupabaseClient<Database>;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (isLocalStorageMode) {
    return mockClient;
  }
  
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured. Please check your environment variables.');
    }
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'permitpath-auth',
      },
    });
  }
  return supabase;
}

export function isSupabaseConfigured(): boolean {
  if (isLocalStorageMode) {
    return true; // Pretend Supabase is configured in localStorage mode
  }
  return !!supabaseUrl && !!supabaseAnonKey;
}

// Export singleton instance
export const supabaseClient = isLocalStorageMode ? mockClient : (isSupabaseConfigured() ? getSupabaseClient() : null);
