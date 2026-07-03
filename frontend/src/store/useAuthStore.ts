import { create } from 'zustand';
import { supabase } from '@/api/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,

  initialize: async () => {
    set({ loading: true });

    // 1. Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user || null;
    set({ session, user });

    if (user) {
      await get().fetchProfile(user.id);
    } else {
      set({ loading: false });
    }

    // 2. Set up auth state listener
    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      const newUser = newSession?.user || null;
      set({ session: newSession, user: newUser });

      if (newUser) {
        await get().fetchProfile(newUser.id);
      } else {
        set({ profile: null, loading: false });
      }
    });
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      set({ profile: data, loading: false });
    } catch (err) {
      console.warn('[useAuthStore] Profile fetch error:', err);
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, loading: false });
  },
}));
