'use server';

import { z } from 'zod';
import { saveProduct, deleteProduct, getProductById } from '@/lib/data';
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
    newImageUrl: z.string().optional(), // La nueva URL de la imagen subida
    existingImageUrl: z.string().optional(), // La URL de la imagen existente si se está editando
});

export async function saveProductAction(data: z.infer<typeof ProductFormSchema>) {
    const parsedProduct = ProductFormSchema.safeParse(data);
    
    if (!parsedProduct.success) {
      console.error(parsedProduct.error.flatten().fieldErrors);
      return { success: false, error: "Invalid product data." };
    }

    const { newImageUrl, existingImageUrl, ...productData } = parsedProduct.data;

    let finalImageUrl = newImageUrl || existingImageUrl;
    
    // Si se subió una nueva imagen y existía una antigua, elimina la antigua.
    // Solo intenta eliminar si la URL antigua es una ruta de imagen local.
    if (newImageUrl && existingImageUrl && existingImageUrl.startsWith('/images/')) {
        try {
            const oldImageName = path.basename(existingImageUrl);
            const oldImagePath = path.join(process.cwd(), 'public', 'images', oldImageName);
            
            if (await fs.pathExists(oldImagePath)) {
                await fs.unlink(oldImagePath);
                console.log(`Successfully deleted old image: ${oldImagePath}`);
            }
        } catch (deleteError) {
            console.error('Failed to delete old image:', deleteError);
            // No detenemos el proceso si falla la eliminación, solo lo registramos.
        }
    }

    try {
        const productToSave = {
            ...productData,
            imageUrl: finalImageUrl || '',
        };
        const savedProduct = await saveProduct(productToSave);
        
        revalidatePath('/admin/products');
        revalidatePath('/shop'); 

        return { success: true, product: savedProduct };
    } catch (dbError) {
        console.error("Error in saveProductAction (database):", dbError);
        return { success: false, error: "Failed to save product on server." };
    }
}


export async function deleteProductAction(productId: string) {
    try {
        const product = await getProductById(productId);

        // Solo intenta eliminar si el producto existe y la URL es una ruta de imagen local.
        if (product && product.imageUrl && product.imageUrl.startsWith('/images/')) {
            try {
                const imageName = path.basename(product.imageUrl);
                const imagePath = path.join(process.cwd(), 'public', 'images', imageName);
                 if (await fs.pathExists(imagePath)) {
                    await fs.unlink(imagePath);
                }
            } catch (error) {
                 console.error('Failed to delete product image during deletion:', error);
                 // No detenemos el proceso si falla la eliminación de la imagen.
            }
        }

        await deleteProduct(productId);

        revalidatePath('/admin/products');
        revalidatePath('/shop');

        return { success: true };
    } catch(error) {
        console.error("Error in deleteProductAction:", error);
        return { success: false, error: "Failed to delete product." };
    }
}
