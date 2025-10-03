'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { PurchaseRequest } from '@/lib/types';
import { useSession } from './use-session';

interface NotificationsContextType {
  requests: PurchaseRequest[];
  notificationCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { session, isLoading: isSessionLoading } = useSession();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const customerId = session?.id;

  const refetch = useCallback(async () => {
    if (session?.role !== 'customer' || !customerId) {
        setRequests([]);
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    setError(null);
    try {
      // Fetch only requests for the logged-in customer
      const res = await fetch(`/api/requests?customerId=${customerId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data: PurchaseRequest[] = await res.json();
      setRequests(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [customerId, session?.role]);

  useEffect(() => {
    if (session?.role === 'customer') {
      refetch();
      const intervalId = setInterval(refetch, 30000); 
      return () => clearInterval(intervalId);
    } else {
        setIsLoading(false);
        setRequests([]);
    }
  }, [refetch, session?.role]);

  const notificationCount = requests.filter(req => req.status === 'confirmed' && !req.isRead).length;

  const contextValue = {
    requests,
    notificationCount,
    isLoading: isSessionLoading || isLoading,
    error,
    refetch
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
      throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
}
