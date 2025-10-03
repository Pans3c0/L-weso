import { NextResponse, NextRequest } from 'next/server';
import { getAllProducts } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId') || undefined;

  try {
    const products = await getAllProducts(sellerId);
    return NextResponse.json(products);
  } catch (error) {
    console.error('API Error fetching products:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
