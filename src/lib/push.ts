'use server';

import type { PushSubscription } from 'web-push';
import webpush from 'web-push';
import path from 'path';
import fs from 'fs-extra';

const dbDirectory = path.join(process.cwd(), 'src', 'lib', 'db');
const subscriptionsFilePath = path.join(dbDirectory, 'subscriptions.json');

// VAPID keys should be stored in environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

let vapidKeysLoaded = false;
if (vapidPublicKey && vapidPrivateKey) {
    try {
        webpush.setVapidDetails(
            'mailto:example@your-domain.com', // Replace with your contact email
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

/**
 * Retrieves all push subscriptions from the data source.
 * Initializes the file as an empty object if it doesn't exist.
 */
async function getSubscriptions(): Promise<Record<string, PushSubscription>> {
    try {
        await fs.ensureDir(dbDirectory);
        await fs.ensureFile(subscriptionsFilePath);
        const data = await fs.readJson(subscriptionsFilePath, { throws: false });
        return data || {};
    } catch (e) {
        console.error("Could not read or initialize subscriptions file.", e);
        return {};
    }
}

/**
 * Saves all push subscriptions to the data source.
 */
async function saveSubscriptions(subscriptions: Record<string, PushSubscription>): Promise<void> {
    try {
        await fs.ensureDir(dbDirectory);
        await fs.outputJson(subscriptionsFilePath, subscriptions, { spaces: 2 });
    } catch (e) {
        console.error("Failed to save subscriptions.", e);
    }
}


/**
 * Sends a push notification to a specific user (customer or seller).
 * @param userId - The ID of the user to notify (can be customerId or sellerId).
 * @param payload - The data to send in the notification.
 */
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
      
      console.log(`Sending push notification to user ${userId}...`);
      await webpush.sendNotification(subscription, notificationPayload);
      console.log('Push notification sent successfully.');

    } else {
      console.log(`No push subscription found for user ${userId}.`);
    }
  } catch (error: any) {
    // If the subscription is expired or invalid, the push service will return an error.
    // We should handle this by removing the invalid subscription.
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log(`Subscription for user ${userId} has expired or is no longer valid. Removing it.`);
      const subscriptions = await getSubscriptions();
      if (subscriptions[userId]) {
        delete subscriptions[userId];
        await saveSubscriptions(subscriptions);
      }
    } else {
      console.error(`Error sending push notification to ${userId}:`, error.body || error.message);
    }
  }
}
