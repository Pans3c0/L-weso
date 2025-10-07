'use server';

import webPush from 'web-push';
import { getSubscriptions, saveSubscription } from './db';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

let vapidKeysLoaded = false;
if (vapidPublicKey && vapidPrivateKey) {
    try {
        webPush.setVapidDetails(
            'mailto:example@your-domain.com',
            vapidPublicKey,
            vapidPrivateKey
        );
        vapidKeysLoaded = true;
        console.log('VAPID keys loaded successfully. Push notifications are configured.');
    } catch (error) {
        console.error("Error setting VAPID details, likely invalid keys:", error);
    }
} else {
    console.warn('VAPID keys not found in environment variables. Push notifications will be disabled.');
}


export async function sendPushNotification(userId: string, payload: { title: string; body: string; url?: string; }) {
  if (!vapidKeysLoaded) {
      console.log('VAPID keys not configured or failed to load, skipping push notification.');
      return;
  }
  
  try {
    const subscriptions = await getSubscriptions();
    const subscription = subscriptions[userId];

    if (subscription) {
      const notificationPayload = JSON.stringify(payload);
      
      await webPush.sendNotification(subscription, notificationPayload);

    } else {
      console.log(`No push subscription found for user ${userId}.`);
    }
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log(`Subscription for user ${userId} has expired or is no longer valid. Removing it.`);
      await saveSubscription(userId, undefined);
    } else {
      console.error(`Error sending push notification to ${userId}:`, error.body || error.message);
    }
  }
}
