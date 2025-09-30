'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { PurchaseRequest } from '@/lib/types';

interface NotificationsContextType {
  requests: PurchaseRequest[];
  notificationCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

async function fetchRequestsForCustomer(customerId: string): Promise<PurchaseRequest[]> {
  // In a real app, you would fetch only the requests for the given customer.
  // For now, we fetch all and filter.
  const res = await fetch('/api/requests');
  if (!res.ok) {
    throw new Error('Failed to fetch requests');
  }
  const allRequests: PurchaseRequest[] = await res.json();
  return allRequests
    .filter(req => req.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerId] = useState('customer_123'); // Mock customer ID

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRequestsForCustomer(customerId);
      setRequests(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const notificationCount = requests.filter(req => req.status === 'confirmed' && !req.isRead).length;

  const contextValue = {
    requests,
    notificationCount,
    isLoading,
    error,
    refetch
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(customerId: string) {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
      throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    // The customerId argument is kept for future use, but for now, the provider handles it.
    return context;
}
