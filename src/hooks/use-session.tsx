'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { SessionUser } from '@/lib/types';


interface SessionContextType {
  session: SessionUser | null;
  login: (user: SessionUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_KEY = 'mercado-vecinal-session';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let storedSession = null;
    try {
      const item = localStorage.getItem(SESSION_KEY);
      if (item) {
        storedSession = JSON.parse(item);
      }
    } catch (error) {
      console.error("Failed to parse session from localStorage", error);
      localStorage.removeItem(SESSION_KEY);
    }
    setSession(storedSession);
    setIsLoading(false);
  }, []);

  const login = useCallback((user: SessionUser) => {
    try {
      const userToSave: SessionUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        sellerId: user.sellerId, // Ensure sellerId is explicitly saved
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(userToSave));
      setSession(userToSave);
    } catch (error) {
      console.error("Failed to save session to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
    } catch (error) {
      console.error("Failed to remove session from localStorage", error);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ session, login, logout, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
