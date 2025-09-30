'use server';

import { improveProductDescription } from '@/ai/flows/improve-product-description';
import { z } from 'zod';
import { saveProducts, getAllProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Schema for validating the input for the AI description improvement action.
 */
const ImproveDescriptionSchema = z.object({
  keywords: z.string(),
  existingDescription: z.string(),
});

/**
 * Server Action: Invokes an AI flow to improve a product description based on keywords.
 * @param input - Contains keywords and the existing description.
 * @returns An object with the improved description or an error message.
 */
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
      productData: '', // This can be extended to pass more structured data in the future.
    });
    return { improvedDescription: result.improvedDescription };
  } catch (error) {
    console.error('AI description improvement failed:', error);
    return { error: 'Failed to improve description.' };
  }
}

/**
 * Server Action: Saves a new product or updates an existing one.
 * It reads all products, finds the one to update or adds a new one,
 * then writes the entire list back to the data source.
 * @param product - The product object to save. If it has an ID, it's an update; otherwise, it's a new product.
 * @returns A success object.
 */
export async function saveProductAction(product: Product) {
  const products = await getAllProducts();
  let updatedProducts;

  if (product.id) {
    // Editing an existing product
    updatedProducts = products.map(p => (p.id === product.id ? product : p));
  } else {
    // Adding a new product with a unique ID
    const newProduct = { ...product, id: `prod_${Date.now()}` };
    updatedProducts = [...products, newProduct];
  }

  await saveProducts(updatedProducts);

  // Revalidate paths to ensure caches are cleared and UI is updated.
  revalidatePath('/admin/products');
  revalidatePath('/'); // Revalidate home page as well

  return { success: true };
}

/**
 * Server Action: Deletes a product by its ID.
 * It filters out the product from the list and saves the updated list.
 * @param productId - The ID of the product to delete.
 * @returns A success object.
 */
export async function deleteProductAction(productId: string) {
    const products = await getAllProducts();
    const updatedProducts = products.filter(p => p.id !== productId);
    await saveProducts(updatedProducts);

    // Revalidate paths to show the updated product list.
    revalidatePath('/admin/products');
    revalidatePath('/');

    return { success: true };
}
