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
});

export async function saveProductAction(
  formData: FormData
) {
    const imageFile = formData.get('imageFile') as File | null;
    const existingImageUrl = formData.get('existingImageUrl') as string | null;

    const productData = {
        id: formData.get('id') as string | undefined,
        sellerId: formData.get('sellerId') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        pricePerGram: formData.get('pricePerGram') as string,
        stockInGrams: formData.get('stockInGrams') as string,
    };
    
    if (productData.id === 'undefined' || productData.id === '') {
        productData.id = undefined;
    }

    const parsedProduct = ProductFormSchema.safeParse({
        ...productData,
        pricePerGram: Number(productData.pricePerGram),
        stockInGrams: Number(productData.stockInGrams),
    });
    
    if (!parsedProduct.success) {
      console.error(parsedProduct.error.flatten().fieldErrors);
      return { success: false, error: "Invalid product data." };
    }
    
    let finalImageUrl: string | undefined = existingImageUrl || undefined;
    const uploadDir = path.join('/', 'public', 'images');

    // Handle new image upload
    if (imageFile && imageFile.size > 0) {
        // Delete old image if a new one is uploaded
        if (existingImageUrl) {
            try {
                // Construct the path inside the container
                const oldImagePath = path.join(uploadDir, path.basename(existingImageUrl));
                 if (await fs.pathExists(oldImagePath)) {
                    await fs.unlink(oldImagePath);
                }
            } catch (error) {
                console.error('Failed to delete old image:', error);
                // Don't block the update if deleting the old image fails
            }
        }
        
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
        
        try {
            await fs.ensureDir(uploadDir);
            const filePath = path.join(uploadDir, fileName);
            await fs.writeFile(filePath, fileBuffer);
            finalImageUrl = `/images/${fileName}`; 
        } catch (error) {
            console.error('Fallo al guardar la imagen:', error);
            return { success: false, error: 'No se pudo guardar la imagen en el servidor.' };
        }
    }

    try {
        const productToSave: Omit<Product, 'id'> & { id?: string } = {
            ...parsedProduct.data,
            imageUrl: finalImageUrl || '', // Ensure imageUrl is not undefined
        };

        const savedProduct = await saveProduct(productToSave);
        
        revalidatePath('/admin/products');
        revalidatePath('/shop'); 

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
        revalidatePath('/shop');

        return { success: true };
    } catch(error) {
        console.error("Error in deleteProductAction:", error);
        return { success: false, error: "Failed to delete product." };
    }
}
