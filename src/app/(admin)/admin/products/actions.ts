'use server';

import { improveProductDescription } from '@/ai/flows/improve-product-description';
import { z } from 'zod';
import { saveProducts, getAllProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const ImproveDescriptionSchema = z.object({
  keywords: z.string(),
  existingDescription: z.string(),
});

export async function improveDescriptionAction(input: {
  keywords: string;
  existingDescription: string;
}) {
  const parsedInput = ImproveDescriptionSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Invalid input' };
  }

  try {
    const result = await improveProductDescription({
      ...parsedInput.data,
      productData: '',
    });
    return { improvedDescription: result.improvedDescription };
  } catch (error) {
    console.error('AI description improvement failed:', error);
    return { error: 'Failed to improve description.' };
  }
}

const ProductSchema = z.object({
    id: z.string().optional(),
    sellerId: z.string().min(1, "Seller ID is required."),
    name: z.string(),
    description: z.string(),
    pricePerGram: z.number(),
    stockInGrams: z.number(),
    imageUrl: z.string().optional(),
    imageHint: z.string().optional().nullable(),
    keywords: z.string().optional(),
});


export async function saveProductAction(product: Omit<Product, 'id'> & { id?: string }) {
  const parsedProduct = ProductSchema.safeParse(product);
  if (!parsedProduct.success) {
      console.error(parsedProduct.error);
      return { success: false, error: "Invalid product data." };
  }
  
  const allProducts = await getAllProducts();
  let updatedProducts;

  if (product.id) {
    updatedProducts = allProducts.map(p => (p.id === product.id ? (product as Product) : p));
  } else {
    const newProduct: Product = { ...parsedProduct.data, id: `prod_${Date.now()}` };
    updatedProducts = [...allProducts, newProduct];
  }

  await saveProducts(updatedProducts);

  revalidatePath('/admin/products');
  revalidatePath('/'); 

  return { success: true };
}


export async function deleteProductAction(productId: string) {
    const products = await getAllProducts();
    const updatedProducts = products.filter(p => p.id !== productId);
    await saveProducts(updatedProducts);

    revalidatePath('/admin/products');
    revalidatePath('/');

    return { success: true };
}
