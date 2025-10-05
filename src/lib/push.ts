'use server';

import type { PushSubscription } from 'web-push';
import webpush from 'web-push';
import path from 'path';
import fs from 'fs-extra';

const dbDirectory = '/app/src/lib/db';
const subscriptionsFilePath = path.join(dbDirectory, 'subscriptions.json');

// VAPID keys should be stored in environment variables
// Ensure the public key is URL-safe Base64 by removing any '=' padding.
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.replace(/=/g, '');
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
    console.log('VAPID keys loaded successfully. Push notifications are configured.');
    webpush.setVapidDetails(
        'mailto:example@your-domain.com', // Replace with your contact email
        vapidPublicKey,
        vapidPrivateKey
    );
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
  if (!vapidPublicKey || !vapidPrivateKey) {
      console.log('VAPID keys not configured, skipping push notification.');
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
      console.log('Subscription has expired or is no longer valid. Removing it.');
      const subscriptions = await getSubscriptions();
      delete subscriptions[userId];
      await saveSubscriptions(subscriptions);
    } else {
      console.error('Error sending push notification:', error);
    }
  }
}
