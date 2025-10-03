<<<<<<< HEAD
import { NextResponse, NextRequest } from 'next/server';
import { getAllProducts } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId') || undefined;
=======
import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/data';
>>>>>>> e4739d1 (La app me esta dando problemas durante su uso, ayudame a resolverlas. Te)

  try {
<<<<<<< HEAD
    // Pass sellerId to fetch only relevant products.
    // If no sellerId is provided, it can fetch all products (for a general catalog, for instance).
    // For this app's logic, we'll assume a customer is always tied to one seller context,
    // but this makes the API more flexible.
    const products = await getAllProducts(sellerId);
=======
    const products = getAllProducts();
    // In a real application, you would fetch this data from a database.
>>>>>>> e4739d1 (La app me esta dando problemas durante su uso, ayudame a resolverlas. Te)
    return NextResponse.json(products);
  } catch (error) {
    console.error('API Error fetching products:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
