// ============================================================
// Batur Tani — Authentication Context
// Manages user session, profile data, and auth operations
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

// ------------------------------------------------------------
// Context Shape
// ------------------------------------------------------------

interface AuthContextValue {
  /** The currently authenticated Supabase user, or null */
  user: User | null;
  /** The user's profile from the 'profiles' table, or null */
  profile: Profile | null;
  /** True while the initial session check is in progress */
  loading: boolean;
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<void>;
  /** Sign up with email, password, and profile details */
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    fullName: string,
    businessName: string
  ) => Promise<void>;
  /** Sign out the current user */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ------------------------------------------------------------
// Provider Component
// ------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------
  // Fetch Profile from 'profiles' table
  // ----------------------------------------------------------

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Failed to fetch profile:', error.message);
        setProfile(null);
        return;
      }

      setProfile(data as Profile);
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching profile:', err);
      setProfile(null);
    }
  }, []);

  // ----------------------------------------------------------
  // Handle Session Changes
  // ----------------------------------------------------------

  const handleSession = useCallback(
    async (session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    },
    [fetchProfile]
  );

  // ----------------------------------------------------------
  // Initialize: check existing session + subscribe to changes
  // ----------------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    // 1. Check for an existing session on mount
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted) {
          await handleSession(session);
        }
      } catch (err) {
        console.error('[AuthContext] Error getting session:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 2. Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        await handleSession(session);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleSession]);

  // ----------------------------------------------------------
  // Auth Operations
  // ----------------------------------------------------------

  /**
   * Sign in with email and password.
   * Throws on failure so the caller can display the error.
   */
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  /**
   * Sign up a new user.
   *
   * Creates the Supabase auth user and inserts a row in the
   * 'profiles' table with the provided role and business info.
   * Throws on failure.
   */
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      role: UserRole,
      fullName: string,
      businessName: string
    ) => {
      // 1. Create the auth user
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
              business_name: businessName,
            },
          },
        });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Pendaftaran gagal. Silakan coba lagi.');
      }
      
      // Note: Profile creation is handled automatically by a database trigger 
      // (handle_new_user) in Supabase.
    },
    []
  );

  /**
   * Sign out the current user and clear local state.
   */
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    setUser(null);
    setProfile(null);
  }, []);

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------

/**
 * Access the auth context. Must be used within an `<AuthProvider>`.
 *
 * @example
 * const { user, profile, signOut } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
