'use server';

import { NextResponse } from 'next/server';
import { saveSubscription } from '@/lib/db';
import type { PushSubscription } from 'web-push';

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

        await saveSubscription(userId, subscription);

        return NextResponse.json({ success: true, message: 'Subscription saved.' });

    } catch (error) {
        console.error('Error saving push subscription:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
