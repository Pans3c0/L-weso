'use server';

import webPush from 'web-push';
import { getSubscriptions, saveSubscription } from './db';
import { getVapidKeys } from './db';

// This function will be called when the server starts.
async function initializeVapid() {
    try {
        const { publicKey, privateKey } = await getVapidKeys();

        if (publicKey && privateKey) {
            webPush.setVapidDetails(
                'mailto:example@your-domain.com',
                publicKey,
                privateKey
            );
            console.log('VAPID keys loaded and configured successfully.');
            return true;
        } else {
            console.warn('VAPID keys are not yet generated. They will be created on the first subscription.');
            return false;
        }
    } catch (error) {
        console.error("Error setting VAPID details:", error);
        return false;
    }
}

// Initialize VAPID details on server startup.
let vapidKeysLoaded = initializeVapid();

export async function sendPushNotification(userId: string, payload: { title: string; body: string; url?: string; }) {
  // Re-check if keys are loaded, in case they were generated after server start
  if (!webPush.getVapidDetails()) {
      const keysLoaded = await initializeVapid();
      if (!keysLoaded) {
          console.log('VAPID keys not configured, skipping push notification.');
          return;
      }
  }
  
  try {
    const subscriptionsData = await getSubscriptions();
    const subscription = subscriptionsData.subscriptions[userId];

    if (subscription) {
      const notificationPayload = JSON.stringify(payload);
      
      await webPush.sendNotification(subscription, notificationPayload);

    } else {
      console.log(`No push subscription found for user ${userId}.`);
    }
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log(`Subscription for user ${userId} has expired or is no longer valid. Removing it.`);
      // Pass the existing data to avoid race conditions
      const currentData = await getSubscriptions();
      await saveSubscription(userId, undefined, currentData);
    } else {
      console.error(`Error sending push notification to ${userId}:`, error.body || error.message);
    }
  }
}
