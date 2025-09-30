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
      productData: '', // Not used as per current requirements
    });
    return { improvedDescription: result.improvedDescription };
  } catch (error) {
    console.error('AI description improvement failed:', error);
    return { error: 'Failed to improve description.' };
  }
}

export async function saveProductAction(product: Product) {
  const products = getAllProducts();
  let updatedProducts;

  if (product.id) {
    // Editing an existing product
    updatedProducts = products.map(p => (p.id === product.id ? product : p));
  } else {
    // Adding a new product
    const newProduct = { ...product, id: `prod_${Date.now()}` };
    updatedProducts = [...products, newProduct];
  }

  saveProducts(updatedProducts);
  revalidatePath('/admin/products');
  revalidatePath('/');
  return { success: true };
}

export async function deleteProductAction(productId: string) {
    const products = getAllProducts();
    const updatedProducts = products.filter(p => p.id !== productId);
    saveProducts(updatedProducts);
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
}
