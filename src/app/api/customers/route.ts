'use server';
import { NextResponse, NextRequest } from 'next/server';
import { getAllCustomers } from '@/lib/customers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId') || undefined;

  try {
    const customers = await getAllCustomers(sellerId);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('API Error fetching customers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
