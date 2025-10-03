'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from './use-session';
import { useToast } from './use-toast';

interface PushNotificationsContextType {
  isSubscribed: boolean;
  isUnsupported: boolean;
  userConsent: NotificationPermission;
  requestPermission: () => void;
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
  const { session } = useSession();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [userConsent, setUserConsent] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Push notifications require a secure context (HTTPS or localhost).
    // Also check for browser support for Service Worker and Push Manager.
    if (!window.isSecureContext || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsUnsupported(true);
        return;
    }

    setUserConsent(Notification.permission);
    
    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error("Error checking for push subscription:", error);
            setIsSubscribed(false);
        }
    };

    navigator.serviceWorker.ready.then(checkSubscription);

  }, []);

  const requestPermission = useCallback(async () => {
     if (isUnsupported || !session) return;

     if (userConsent === 'denied') {
        toast({
            title: 'Permiso de notificaciones bloqueado',
            description: 'Debes permitir las notificaciones en la configuración de tu navegador para activar esta función.',
            variant: 'destructive',
        });
        return;
     }

    try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        
        const consent = await Notification.requestPermission();
        setUserConsent(consent);

        if (consent !== 'granted') {
            toast({
                title: 'Permiso denegado',
                description: 'No podremos notificarte sobre tus pedidos.',
            });
            return;
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });

        await fetch('/api/save-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subscription, customerId: session.id }),
        });

        setIsSubscribed(true);
        toast({
            title: '¡Notificaciones activadas!',
            description: 'Te avisaremos cuando tus pedidos se confirmen.',
        });

    } catch (error) {
        console.error('Failed to subscribe to push notifications', error);
        toast({
            title: 'Error de suscripción',
            description: 'No se pudieron activar las notificaciones. Inténtalo de nuevo.',
            variant: 'destructive',
        });
    }
  }, [isUnsupported, session, userConsent, toast]);

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
