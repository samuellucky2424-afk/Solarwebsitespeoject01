import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSupabase, loadConfig } from '../config/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
}

const AUTH_PERSISTENCE_KEY = 'greenlife-auth-persistence';
const TEMP_SESSION_KEY = 'greenlife-temp-session';
const NON_REMEMBERED_SESSION_MS = 12 * 60 * 60 * 1000;
const REMEMBERED_SESSION_MS = 30 * 24 * 60 * 60 * 1000;

type AuthPersistence = {
  rememberMe: boolean;
  signedInAt: number;
};

function readAuthPersistence(): AuthPersistence | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(AUTH_PERSISTENCE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthPersistence>;
    if (typeof parsed.rememberMe !== 'boolean' || typeof parsed.signedInAt !== 'number') {
      return null;
    }

    return {
      rememberMe: parsed.rememberMe,
      signedInAt: parsed.signedInAt,
    };
  } catch {
    return null;
  }
}

export function persistAuthPreference(rememberMe: boolean) {
  if (typeof window === 'undefined') return;

  const payload: AuthPersistence = {
    rememberMe,
    signedInAt: Date.now(),
  };

  window.localStorage.setItem(AUTH_PERSISTENCE_KEY, JSON.stringify(payload));

  if (rememberMe) {
    window.sessionStorage.removeItem(TEMP_SESSION_KEY);
  } else {
    window.sessionStorage.setItem(TEMP_SESSION_KEY, 'active');
  }
}

export function clearAuthPreference() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_PERSISTENCE_KEY);
  window.sessionStorage.removeItem(TEMP_SESSION_KEY);
}

function shouldInvalidateRecoveredSession() {
  if (typeof window === 'undefined') return false;

  const persistence = readAuthPersistence();

  // Legacy sessions created before remember-me tracking are treated as expired.
  if (!persistence) {
    return true;
  }

  const age = Date.now() - persistence.signedInAt;

  if (persistence.rememberMe) {
    return age > REMEMBERED_SESSION_MS;
  }

  const browserSessionEnded = !window.sessionStorage.getItem(TEMP_SESSION_KEY);
  return browserSessionEnded || age > NON_REMEMBERED_SESSION_MS;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    let subscription: any;

    const initAuth = async () => {
      try {
        // Wait for robust runtime config to load
        await loadConfig();
        const client = getSupabase();

        // Check active session
        const { data: { session: initSession } } = await client.auth.getSession();

        if (initSession && shouldInvalidateRecoveredSession()) {
          await client.auth.signOut();
          clearAuthPreference();

          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(initSession);
          setUser(initSession?.user ?? null);
          setLoading(false);
        }

        // Listen for changes
        const { data } = client.auth.onAuthStateChange((_event, currentSession) => {
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setLoading(false);
          }
        });
        subscription = data.subscription;

      } catch (err: any) {
        if (mounted) {
          const isAbort = err.name === 'AbortError' || err.message?.includes('AbortError') || err.message?.includes('signal is aborted');
          if (!isAbort) {
            console.error("Auth session check error:", err);
          }
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    const client = getSupabase();
    await client.auth.signOut();
    clearAuthPreference();
    navigate('/login');
  };

  // Protect Dashboard Routes
  useEffect(() => {
    if (loading) return;

    const protectedRoutes = ['/dashboard', '/requests', '/service-request'];
    const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

    if (isProtectedRoute && !session) {
      navigate('/login');
    }
  }, [session, loading, location.pathname, navigate]);

  const value = {
    isAuthenticated: !!session,
    user,
    session,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
