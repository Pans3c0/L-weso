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
});

export async function saveProductAction(formData: FormData) {
    const id = formData.get('id') as string | undefined;
    const existingImageUrl = formData.get('existingImageUrl') as string | null;
    const imageFile = formData.get('imageFile') as File | null;

    const parsedProduct = ProductFormSchema.safeParse({
        id: id === 'undefined' ? undefined : id,
        sellerId: formData.get('sellerId') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        pricePerGram: Number(formData.get('pricePerGram')),
        stockInGrams: Number(formData.get('stockInGrams')),
    });
    
    if (!parsedProduct.success) {
      console.error(parsedProduct.error.flatten().fieldErrors);
      return { success: false, error: "Invalid product data." };
    }

    let finalImageUrl = existingImageUrl;

    // 1. Si hay una nueva imagen, súbela y obtén la nueva URL
    if (imageFile && imageFile.size > 0) {
        try {
            const uploadDir = path.join(process.cwd(), 'public', 'images');
            await fs.ensureDir(uploadDir);

            const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
            const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
            const filePath = path.join(uploadDir, fileName);

            await fs.writeFile(filePath, fileBuffer);
            finalImageUrl = `/images/${fileName}`; // URL pública relativa
        } catch (uploadError) {
            console.error('Error al subir la imagen:', uploadError);
            return { success: false, error: 'No se pudo subir la imagen.' };
        }
    }
    
    // 2. Si se subió una nueva imagen y existía una antigua, elimina la antigua
    if (finalImageUrl !== existingImageUrl && existingImageUrl && existingImageUrl.startsWith('/images/')) {
        try {
            const oldImageName = path.basename(existingImageUrl);
            const oldImagePath = path.join(process.cwd(), 'public', 'images', oldImageName);
            
            if (await fs.pathExists(oldImagePath)) {
                await fs.unlink(oldImagePath);
                console.log(`Successfully deleted old image: ${oldImagePath}`);
            }
        } catch (deleteError) {
            console.error('Failed to delete old image:', deleteError);
            // No detenemos el proceso, solo lo registramos
        }
    }

    // 3. Guarda el producto en la base de datos con la URL de imagen final
    try {
        const productDataWithImage = {
            ...parsedProduct.data,
            imageUrl: finalImageUrl || '', // Asegura que siempre haya un valor
        };
        const savedProduct = await saveProduct(productDataWithImage);
        
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

        if (product && product.imageUrl && product.imageUrl.startsWith('/images/')) {
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

        await deleteProduct(productId);

        revalidatePath('/admin/products');
        revalidatePath('/shop');

        return { success: true };
    } catch(error) {
        console.error("Error in deleteProductAction:", error);
        return { success: false, error: "Failed to delete product." };
    }
}
