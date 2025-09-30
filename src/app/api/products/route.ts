import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/data';

export async function GET() {
  try {
    const products = getAllProducts();
    // In a real application, you would fetch this data from a database.
    return NextResponse.json(products);
  } catch (error) {
    console.error('API Error fetching products:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
