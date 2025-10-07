'use server';
import { NextResponse, NextRequest } from 'next/server';
import { getPurchaseRequests } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId') || undefined;
  const customerId = searchParams.get('customerId') || undefined;

  try {
    let requests = await getPurchaseRequests();
    
    if (sellerId) {
        requests = requests.filter(req => req.sellerId === sellerId);
    }
    
    if (customerId) {
        requests = requests.filter(req => req.customerId === customerId);
    }
    
    return NextResponse.json(requests);
  } catch (error) {
    console.error('API Error fetching requests:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
