'use server';

import { z } from 'zod';
import { saveProduct, deleteProduct } from '@/lib/data';
import type { Product } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import fs from 'fs-extra';
import path from 'path';

const ProductSchema = z.object({
    id: z.string().optional(),
    sellerId: z.string().min(1, "Seller ID is required."),
    name: z.string(),
    description: z.string(),
    pricePerGram: z.number(),
    stockInGrams: z.number(),
    imageUrl: z.string().optional(),
    imageHint: z.string().optional().nullable(),
});


export async function saveProductAction(productData: Omit<Product, 'id'> & { id?: string }) {
  const parsedProduct = ProductSchema.safeParse(productData);
  if (!parsedProduct.success) {
      console.error(parsedProduct.error);
      return { success: false, error: "Invalid product data." };
  }
  
  try {
    const savedProduct = await saveProduct(parsedProduct.data);
    revalidatePath('/admin/products');
    revalidatePath('/'); 

    return { success: true, product: savedProduct };
  } catch (error) {
    console.error("Error in saveProductAction:", error);
    return { success: false, error: "Failed to save product on server." };
  }
}


export async function deleteProductAction(productId: string) {
    try {
        await deleteProduct(productId);
        revalidatePath('/admin/products');
        revalidatePath('/');

        return { success: true };
    } catch(error) {
        console.error("Error in deleteProductAction:", error);
        return { success: false, error: "Failed to delete product." };
    }
}


export async function uploadImageAction(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const uploadDir = path.join(process.cwd(), 'public/images');
  
  await fs.ensureDir(uploadDir);
  const filePath = path.join(uploadDir, fileName);

  try {
    await fs.writeFile(filePath, fileBuffer);
    const imageUrl = `/images/${fileName}`; // Path to be used in <img> src
    return { success: true, imageUrl };
  } catch (error) {
    console.error('Failed to save image:', error);
    return { success: false, error: 'Failed to save image.' };
  }
}