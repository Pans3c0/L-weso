'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from './use-toast';
import { sendTestNotificationAction } from '@/app/(admin)/admin/requests/actions';

interface PushNotificationsContextType {
  isSubscribed: boolean;
  isUnsupported: boolean;
  userConsent: NotificationPermission;
  requestPermission: (userId: string) => void;
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

  useEffect(() => {
    if (typeof window === 'undefined' || !window.isSecureContext || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsUnsupported(true);
        return;
    }

    // Set initial consent state
    setUserConsent(Notification.permission);

    // Register service worker
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('Service Worker registered successfully.');
      // Check for existing subscription
      registration.pushManager.getSubscription().then(subscription => {
        setIsSubscribed(!!subscription);
      });
    }).catch(error => {
      console.error("Service Worker registration failed:", error);
      setIsUnsupported(true); // Treat registration failure as unsupported
    });
  }, []);

  const requestPermission = useCallback(async (userId: string) => {
     if (isUnsupported || !userId) {
        console.log('Push notifications unsupported or no user ID.');
        return;
     }

     if (userConsent === 'denied') {
        toast({
            title: 'Permiso de notificaciones bloqueado',
            description: 'Debes permitir las notificaciones en la configuración de tu navegador para activar esta función.',
            variant: 'destructive',
        });
        return;
     }

    try {
        const consent = await Notification.requestPermission();
        setUserConsent(consent);

        if (consent !== 'granted') {
            toast({
                title: 'Permiso denegado',
                description: 'No podremos enviarte notificaciones.',
            });
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          throw new Error('VAPID public key is not defined');
        }

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });
        }
        
        await fetch('/api/save-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subscription, userId }),
        });

        setIsSubscribed(true);
        toast({
            title: '¡Notificaciones activadas!',
            description: 'Te avisaremos sobre eventos importantes. Enviando una prueba...',
        });

        await sendTestNotificationAction(userId);

    } catch (error) {
        console.error('Failed to subscribe to push notifications', error);
        toast({
            title: 'Error de suscripción',
            description: 'No se pudieron activar las notificaciones. Inténtalo de nuevo.',
            variant: 'destructive',
        });
    }
  }, [isUnsupported, userConsent, toast]);

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
