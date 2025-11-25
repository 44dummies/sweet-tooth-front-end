import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  avatar?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef<number>(Date.now());
  const activityWriteRef = useRef<number>(0);
  const idleTimerRef = useRef<number | null>(null);

  const IDLE_LIMIT_MS = 30 * 60 * 1000;
  const ACTIVITY_DEBOUNCE_MS = 60 * 1000;

  useEffect(() => {
    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    setupAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {

        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          const user = await supabase.auth.getUser();
          if (user.data.user) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: userId,
                username: user.data.user.email?.split('@')[0],
                first_name: user.data.user.user_metadata?.first_name || '',
                last_name: user.data.user.user_metadata?.last_name || '',
              }])
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
            } else {
              setProfile(newProfile);
            }
          }
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) return { error, data: null };

      if (data.user) {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        const { error: historyError } = await supabase
          .from('password_history')
          .insert({
            user_id: data.user.id,
            password_hash: hashedPassword,
          });

        if (historyError) {

        }
      }

      return { error: null, data };
    } catch (error) {
      return { error, data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const safeUpdates: any = { ...updates };
      if ('avatar' in safeUpdates && safeUpdates.avatar !== undefined) {
        safeUpdates.avatar_url = safeUpdates.avatar;
      }
      delete safeUpdates.avatar;

      const { error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', user.id);

      if (error) {
        console.error('Update profile error:', error);
        return { error };
      }

      await fetchProfile(user.id);
      return { error: null };
    } catch (error: any) {
      console.error('Update profile exception:', error);
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const deleteAccount = async () => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) return { error: profileError };

      const { error: authError } = await supabase.rpc('delete_user');

      if (authError) {
        console.warn('delete_user RPC not available, signing out instead');
      }

      await signOut();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    if (!user) {
      if (idleTimerRef.current) window.clearInterval(idleTimerRef.current);
      return;
    }

    const markActive = () => {
      lastActivityRef.current = Date.now();
      if (Date.now() - activityWriteRef.current > ACTIVITY_DEBOUNCE_MS) {
        activityWriteRef.current = Date.now();
        supabase
          .from('profiles')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', user.id)
          .then(() => {  }, () => {  });
      }
    };

    const checkIdle = () => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs > IDLE_LIMIT_MS) {
        supabase.auth.signOut().finally(() => {
          setUser(null);
          setProfile(null);
          setSession(null);
        });
      }
    };

    const activityEvents: (keyof WindowEventMap)[] = ["mousemove","keydown","click","touchstart","scroll"];
    activityEvents.forEach(evt => window.addEventListener(evt, markActive, { passive: true }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) markActive(); });
    idleTimerRef.current = window.setInterval(checkIdle, 60000);

    return () => {
      if (idleTimerRef.current) window.clearInterval(idleTimerRef.current);
      activityEvents.forEach(evt => window.removeEventListener(evt, markActive));
      document.removeEventListener('visibilitychange', () => { if (!document.hidden) markActive(); });
    };
  }, [user]);

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
