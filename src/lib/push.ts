'use server';

import type { PushSubscription } from 'web-push';
import webpush from 'web-push';
import path from 'path';
import fs from 'fs-extra';

// This ensures that environment variables from .env file are loaded
// especially for non-Next.js contexts like scripts or server actions run standalone.
// Note: Next.js automatically handles .env for its server/client builds.
// This is now handled at the execution context level (e.g., docker run -e)

const subscriptionsFilePath = path.resolve(process.cwd(), 'src/lib/db/subscriptions.json');

// VAPID keys should be stored in environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        'mailto:example@your-domain.com', // Replace with your contact email
        vapidPublicKey,
        vapidPrivateKey
    );
}

/**
 * Retrieves all push subscriptions from the data source.
 * Initializes the file as an empty object if it doesn't exist.
 */
async function getSubscriptions(): Promise<Record<string, PushSubscription>> {
    try {
        const data = await fs.readJson(subscriptionsFilePath, { throws: false });
        if (!data) {
            await fs.outputJson(subscriptionsFilePath, {}, { spaces: 2 });
            return {};
        }
        return data;
    } catch (e) {
        console.error("Could not read or initialize subscriptions file.", e);
        return {};
    }
}

/**
 * Sends a push notification to a specific customer.
 * @param customerId - The ID of the customer to notify.
 * @param payload - The data to send in the notification.
 */
export async function sendPushNotification(customerId: string, payload: { title: string; body: string; url?: string; }) {
  if (!vapidPublicKey || !vapidPrivateKey) {
      console.log('VAPID keys not configured, skipping push notification.');
      return;
  }
  
  try {
    const subscriptions = await getSubscriptions();
    const subscription = subscriptions[customerId];

    if (subscription) {
      const notificationPayload = JSON.stringify(payload);
      
      console.log(`Sending push notification to customer ${customerId}...`);
      await webpush.sendNotification(subscription, notificationPayload);
      console.log('Push notification sent successfully.');

    } else {
      console.log(`No push subscription found for customer ${customerId}.`);
    }
  } catch (error: any) {
    // If the subscription is expired or invalid, the push service will return an error.
    // We should handle this by removing the invalid subscription.
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log('Subscription has expired or is no longer valid. Removing it.');
      const subscriptions = await getSubscriptions();
      delete subscriptions[customerId];
      await fs.outputJson(subscriptionsFilePath, subscriptions, { spaces: 2 });
    } else {
      console.error('Error sending push notification:', error);
    }
  }
}
