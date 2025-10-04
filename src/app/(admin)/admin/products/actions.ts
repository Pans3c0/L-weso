'use server';

import { z } from 'zod';
import { saveProduct, deleteProduct } from '@/lib/data';
import type { Product } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import fs from 'fs-extra';
import path from 'path';

const ProductFormSchema = z.object({
    id: z.string().optional(),
    sellerId: z.string().min(1, "Seller ID is required."),
    name: z.string().min(3, 'El nombre es obligatorio'),
    description: z.string().min(10, 'La descripción es obligatoria'),
    pricePerGram: z.coerce.number().positive('El precio debe ser un número positivo'),
    stockInGrams: z.coerce.number().int().nonnegative('El stock debe ser un número entero no negativo'),
    imageUrl: z.string().optional(),
});

export async function saveProductAction(
  formData: FormData
) {
    const imageFile = formData.get('imageFile') as File | null;
    const existingImageUrl = formData.get('imageUrl') as string || undefined;

    const productData = {
        id: formData.get('id') as string || undefined,
        sellerId: formData.get('sellerId') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        pricePerGram: formData.get('pricePerGram') as string,
        stockInGrams: formData.get('stockInGrams') as string,
    };
    
    // Check if id is an empty string and convert to undefined
    if (productData.id === '') {
        productData.id = undefined;
    }


    const parsedProduct = ProductFormSchema.safeParse({
        ...productData,
        pricePerGram: Number(productData.pricePerGram),
        stockInGrams: Number(productData.stockInGrams),
        imageUrl: existingImageUrl,
    });
    
    if (!parsedProduct.success) {
      console.error(parsedProduct.error.flatten().fieldErrors);
      return { success: false, error: "Invalid product data." };
    }

    let finalImageUrl = parsedProduct.data.imageUrl;

    // Handle image upload only if a new file is provided
    if (imageFile && imageFile.size > 0) {
        if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
            return { success: false, error: 'El archivo es demasiado grande (máx 5MB).' };
        }
        
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public/images');
        
        try {
            await fs.ensureDir(uploadDir);
            const filePath = path.join(uploadDir, fileName);
            await fs.writeFile(filePath, fileBuffer);
            finalImageUrl = `/images/${fileName}`; // Set the new image URL
        } catch (error) {
            console.error('Fallo al guardar la imagen:', error);
            return { success: false, error: 'No se pudo guardar la imagen en el servidor.' };
        }
    }

    try {
        const productToSave: Omit<Product, 'id'> & { id?: string } = {
            ...parsedProduct.data,
            imageUrl: finalImageUrl // Use the potentially new URL
        };

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
