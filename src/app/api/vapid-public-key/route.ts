
import { NextResponse } from 'next/server';
import { getVapidKeys } from '@/lib/db';

export async function GET() {
  try {
    const { publicKey } = await getVapidKeys();
    if (!publicKey) {
      return new NextResponse('VAPID public key not found on server.', { status: 500 });
    }
    return NextResponse.json({ publicKey });
  } catch (error) {
    console.error('API Error fetching VAPID public key:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
