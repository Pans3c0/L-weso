'use server';

import { z } from 'zod';
import { saveProduct, deleteProduct } from '@/lib/data';
import type { Product } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import fs from 'fs-extra';
import path from 'path';

// Helper function to handle image upload, not exported as an action
async function uploadImage(file: File): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  if (!file) {
    return { success: false, error: 'No se ha proporcionado ningún archivo.' };
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const uploadDir = path.join(process.cwd(), 'public/images');
  
  try {
    await fs.ensureDir(uploadDir);
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, fileBuffer);
    const imageUrl = `/images/${fileName}`;
    return { success: true, imageUrl };
  } catch (error) {
    console.error('Fallo al guardar la imagen:', error);
    return { success: false, error: 'No se pudo guardar la imagen en el servidor.' };
  }
}

const ProductSchema = z.object({
    id: z.string().optional(),
    sellerId: z.string().min(1, "Seller ID is required."),
    name: z.string().min(3, 'El nombre es obligatorio'),
    description: z.string().min(10, 'La descripción es obligatoria'),
    pricePerGram: z.coerce.number().positive('El precio debe ser un número positivo'),
    stockInGrams: z.coerce.number().int().nonnegative('El stock debe ser un número entero no negativo'),
    imageUrl: z.string().optional(),
});


export async function saveProductAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const productData = {
    ...rawData,
    id: rawData.id === 'undefined' ? undefined : rawData.id,
  };
  
  const parsedProduct = ProductSchema.safeParse(productData);

  if (!parsedProduct.success) {
      console.error(parsedProduct.error.flatten().fieldErrors);
      return { success: false, error: "Invalid product data." };
  }
  
  const { id, sellerId, name, description, pricePerGram, stockInGrams } = parsedProduct.data;
  let imageUrl = parsedProduct.data.imageUrl;
  
  const imageFile = formData.get('imageFile') as File | null;

  if (imageFile && imageFile.size > 0) {
    const uploadResult = await uploadImage(imageFile);
    if (uploadResult.success && uploadResult.imageUrl) {
      imageUrl = uploadResult.imageUrl;
    } else {
      return { success: false, error: uploadResult.error || 'Failed to upload image.' };
    }
  }

  try {
    const productToSave: Omit<Product, 'id'> & { id?: string } = {
        id,
        sellerId,
        name,
        description,
        pricePerGram,
        stockInGrams,
        imageUrl
    }

    const savedProduct = await saveProduct(productToSave);
    
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
