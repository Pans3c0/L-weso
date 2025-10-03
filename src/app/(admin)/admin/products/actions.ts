'use server';

import { z } from 'zod';
import { getAllProducts, saveProducts } from '@/lib/data';
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


export async function saveProductAction(product: Omit<Product, 'id' | 'keywords'> & { id?: string }) {
  const parsedProduct = ProductSchema.safeParse(product);
  if (!parsedProduct.success) {
      console.error(parsedProduct.error);
      return { success: false, error: "Invalid product data." };
  }
  
  const allProducts = await getAllProducts();
  let updatedProducts;

  const productToSave = {
    ...parsedProduct.data,
    sellerId: product.sellerId,
  };

  if (product.id) {
    updatedProducts = allProducts.map(p => (p.id === product.id ? (productToSave as Product) : p));
  } else {
    const newProduct: Product = { ...productToSave, id: `prod_${Date.now()}` };
    updatedProducts = [...allProducts, newProduct];
  }

  await saveProducts(updatedProducts);

  revalidatePath('/admin/products');
  revalidatePath('/'); 

  return { success: true, product: productToSave };
}


export async function deleteProductAction(productId: string) {
    const products = await getAllProducts();
    const updatedProducts = products.filter(p => p.id !== productId);
    await saveProducts(updatedProducts);

    revalidatePath('/admin/products');
    revalidatePath('/');

    return { success: true };
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