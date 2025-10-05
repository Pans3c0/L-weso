'use server';

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs-extra';
import type { PushSubscription } from 'web-push';

const dbDirectory = '/app/src/lib/db';
const subscriptionsFilePath = path.join(dbDirectory, 'subscriptions.json');


type SubscriptionData = {
    subscription: PushSubscription;
    userId: string;
};

export async function POST(request: Request) {
    try {
        const body: SubscriptionData = await request.json();
        const { subscription, userId } = body;

        if (!subscription || !userId) {
            return new NextResponse('Invalid subscription data', { status: 400 });
        }

        const allSubscriptions = await getSubscriptions();
        allSubscriptions[userId] = subscription;
        await saveSubscriptions(allSubscriptions);

        return NextResponse.json({ success: true, message: 'Subscription saved.' });

    } catch (error) {
        console.error('Error saving push subscription:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}


/**
 * Retrieves all push subscriptions from the data source.
 */
async function getSubscriptions(): Promise<Record<string, PushSubscription>> {
    try {
        await fs.ensureDir(dbDirectory);
        await fs.ensureFile(subscriptionsFilePath);
        const data = await fs.readJson(subscriptionsFilePath, { throws: false });
        return data || {};
    } catch (e) {
        console.error("Could not read subscriptions file.", e);
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
