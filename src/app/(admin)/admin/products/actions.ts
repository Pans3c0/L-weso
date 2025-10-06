'use server';

import { z } from 'zod';
import { saveProduct, deleteProduct, getProductById } from '@/lib/data';
import type { Product } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import fs from 'fs-extra';
import path from 'path';

// La configuración del límite de tamaño del body se ha movido a next.config.js
// y a la ruta API /api/upload para un control más efectivo.
// Eliminar 'export const config' de aquí es intencional.

const ProductFormSchema = z.object({
    id: z.string().optional(),
    sellerId: z.string().min(1, "Seller ID is required."),
    name: z.string().min(3, 'El nombre es obligatorio'),
    description: z.string().min(10, 'La descripción es obligatoria'),
    pricePerGram: z.coerce.number().positive('El precio debe ser un número positivo'),
    stockInGrams: z.coerce.number().int().nonnegative('El stock debe ser un número entero no negativo'),
    imageUrl: z.string().optional(), // La URL de la imagen ahora es un campo de texto
});

export async function saveProductAction(
  formData: FormData
) {
    const id = formData.get('id') as string | undefined;
    const existingImageUrl = formData.get('existingImageUrl') as string | null;
    const newImageUrl = formData.get('imageUrl') as string | null;

    const productData = {
        id: id === 'undefined' ? undefined : id,
        sellerId: formData.get('sellerId') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        pricePerGram: formData.get('pricePerGram') as string,
        stockInGrams: formData.get('stockInGrams') as string,
        imageUrl: newImageUrl || existingImageUrl || '',
    };
    
    const parsedProduct = ProductFormSchema.safeParse({
        ...productData,
        pricePerGram: Number(productData.pricePerGram),
        stockInGrams: Number(productData.stockInGrams),
    });
    
    if (!parsedProduct.success) {
      console.error(parsedProduct.error.flatten().fieldErrors);
      return { success: false, error: "Invalid product data." };
    }
    
    // Si se proporcionó una nueva URL de imagen y existía una antigua, eliminamos la antigua
    if (newImageUrl && existingImageUrl) {
        try {
            // Extraer el nombre del archivo de la URL relativa (ej: de '/images/foto.jpg' a 'foto.jpg')
            const oldImageName = path.basename(existingImageUrl);
            const oldImagePath = path.join(process.cwd(), 'public', 'images', oldImageName);
            
            if (await fs.pathExists(oldImagePath)) {
                await fs.unlink(oldImagePath);
                console.log(`Successfully deleted old image: ${oldImagePath}`);
            }
        } catch (error) {
            console.error('Failed to delete old image:', error);
            // No detenemos el proceso, solo lo registramos
        }
    }

    try {
        const savedProduct = await saveProduct(parsedProduct.data);
        
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
        const product = await getProductById(productId);

        // Primero, elimina la imagen asociada si existe
        if (product && product.imageUrl) {
            try {
                const imageName = path.basename(product.imageUrl);
                const imagePath = path.join(process.cwd(), 'public', 'images', imageName);
                 if (await fs.pathExists(imagePath)) {
                    await fs.unlink(imagePath);
                }
            } catch (error) {
                 console.error('Failed to delete product image during deletion:', error);
            }
        }

        // Luego, elimina el producto de la base de datos
        await deleteProduct(productId);

        revalidatePath('/admin/products');
        revalidatePath('/shop');

        return { success: true };
    } catch(error) {
        console.error("Error in deleteProductAction:", error);
        return { success: false, error: "Failed to delete product." };
    }
}
