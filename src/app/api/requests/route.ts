import { NextResponse } from 'next/server';
import { getPurchaseRequests } from '@/lib/requests';

export async function GET() {
  try {
    const requests = getPurchaseRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error('API Error fetching requests:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
