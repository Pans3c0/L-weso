// THIS IS A NEW FILE
import { NextResponse } from 'next/server';
import { getAllCustomers } from '@/lib/customers';

export async function GET() {
  try {
    const customers = await getAllCustomers();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('API Error fetching customers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
