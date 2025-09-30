'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type UserRole = 'admin' | 'customer';

interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
}

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
    try {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        setSession(JSON.parse(storedSession));
      }
    } catch (error) {
      console.error("Failed to parse session from localStorage", error);
      localStorage.removeItem(SESSION_KEY);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback((user: SessionUser) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setSession(user);
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
