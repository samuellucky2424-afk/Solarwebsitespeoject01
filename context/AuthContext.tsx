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