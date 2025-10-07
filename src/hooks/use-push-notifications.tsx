'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from './use-toast';
import { sendTestNotificationAction } from '@/app/(admin)/admin/requests/actions';

interface PushNotificationsContextType {
  isSubscribed: boolean;
  isUnsupported: boolean;
  userConsent: NotificationPermission;
  requestPermission: (userId: string) => Promise<void>;
}

const PushNotificationsContext = createContext<PushNotificationsContextType | undefined>(undefined);

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushNotificationsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [userConsent, setUserConsent] = useState<NotificationPermission>('default');
  
  // Effect to check support and current subscription status on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsUnsupported(true);
        return;
    }
    
    setUserConsent(Notification.permission);

    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('Service Worker registered.');
      return registration.pushManager.getSubscription();
    }).then(subscription => {
      setIsSubscribed(!!subscription);
    }).catch(error => {
      console.error("Service Worker registration failed:", error);
      setIsUnsupported(true);
    });

  }, []);
  
  const subscribeUser = useCallback(async (userId: string) => {
    try {
        const registration = await navigator.serviceWorker.ready;
        
        // Fetch the VAPID public key from our new API route
        const vapidPublicKeyResponse = await fetch('/api/vapid-public-key');
        if (!vapidPublicKeyResponse.ok) {
            throw new Error('Failed to fetch VAPID public key from server.');
        }
        const { publicKey } = await vapidPublicKeyResponse.json();

        if (!publicKey) {
             throw new Error('VAPID public key is missing from server response.');
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        
        const response = await fetch('/api/save-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription, userId }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to save subscription on server.');
        }

        setIsSubscribed(true);
        toast({
            title: '¡Notificaciones activadas!',
            description: 'Te avisaremos sobre eventos importantes. Enviando una prueba...',
        });

        await sendTestNotificationAction(userId);

    } catch (error) {
        console.error('Failed to subscribe user:', error);
        toast({
            title: 'Error de suscripción',
            description: error instanceof Error ? error.message : 'No se pudieron activar las notificaciones.',
            variant: 'destructive',
        });
        setIsSubscribed(false);
    }
  }, [toast]);
  

  const requestPermission = useCallback(async (userId: string) => {
     if (isUnsupported) {
        toast({ title: 'No Soportado', description: 'Las notificaciones no son soportadas en este navegador.'});
        return;
     }
     
     if (userConsent === 'denied') {
        toast({
            title: 'Permiso bloqueado',
            description: 'Debes permitir las notificaciones en la configuración de tu navegador.',
            variant: 'destructive',
        });
        return;
     }

    const consent = await Notification.requestPermission();
    setUserConsent(consent);
    
    if (consent === 'granted') {
      await subscribeUser(userId);
    } else {
        toast({
            title: 'Permiso denegado',
            description: 'No podremos enviarte notificaciones.',
        });
    }

  }, [isUnsupported, userConsent, toast, subscribeUser]);

  const contextValue = {
    isSubscribed,
    isUnsupported,
    userConsent,
    requestPermission
  };

  return (
    <PushNotificationsContext.Provider value={contextValue}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

export function usePushNotifications() {
  const context = useContext(PushNotificationsContext);
  if (context === undefined) {
    throw new Error('usePushNotifications must be used within a PushNotificationsProvider');
  }
  return context;
}
