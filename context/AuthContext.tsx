import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 24 Hours in milliseconds
const INACTIVITY_LIMIT = 24 * 60 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('greenlife_auth') === 'true';
  });

  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('greenlife_auth');
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate('/login');
  }, [navigate]);

  const login = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem('greenlife_auth', 'true');
    resetTimer();
    navigate('/dashboard');
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      console.log("Auto-logout due to inactivity");
      logout();
    }, INACTIVITY_LIMIT);
  }, [isAuthenticated, logout]);

  // Event listeners for activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetTimer();
    };

    // Initial timer start
    resetTimer();

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, resetTimer]);

  // Protect Dashboard Routes
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/requests', '/service-request'];
    const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

    if (isProtectedRoute && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};