'use server';

import { z } from 'zod';
import { saveProduct, deleteProduct, getProductById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const ProductFormSchema = z.object({
    id: z.string().optional(),
    sellerId: z.string().min(1, "Seller ID is required."),
    name: z.string().min(3, 'El nombre es obligatorio'),
    description: z.string().min(10, 'La descripción es obligatoria'),
    pricePerGram: z.coerce.number().positive('El precio debe ser un número positivo'),
    stockInGrams: z.coerce.number().int().nonnegative('El stock debe ser un número entero no negativo'),
    imageFile: z.instanceof(File).optional(),
    existingImageUrl: z.string().optional(),
});

export async function saveProductAction(formData: FormData) {
    const rawData = {
        ...Object.fromEntries(formData.entries()),
        imageFile: formData.get('imageFile') as File,
    };
    
    // Server-side validation
    const parsedData = ProductFormSchema.safeParse(rawData);
    
    if (!parsedData.success) {
      console.error(parsedData.error.flatten().fieldErrors);
      return { success: false, error: "Invalid product data." };
    }

    try {
        const savedProduct = await saveProduct(parsedData.data);
        
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
        await deleteProduct(productId);
        revalidatePath('/admin/products');
        revalidatePath('/shop');
        return { success: true };
    } catch(error) {
        console.error("Error in deleteProductAction:", error);
        return { success: false, error: "Failed to delete product." };
    }
}
