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
    imageUrl: z.string().optional(),
});

export async function saveProductAction(
  formData: FormData
) {
    const id = formData.get('id') as string | undefined;
    const imageFile = formData.get('imageFile') as File | null;
    const existingImageUrl = formData.get('existingImageUrl') as string | null;
    let newImageUrl: string | null = null;
    
    // 1. Si hay una nueva imagen, súbela primero
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'images');
        await fs.ensureDir(uploadDir);

        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, fileBuffer);
        newImageUrl = `/images/${fileName}`;

      } catch (error) {
        console.error('Error al subir la imagen:', error);
        return { success: false, error: 'No se pudo subir la imagen.' };
      }
    }

    // 2. Prepara los datos del producto
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
    
    // 3. Si se proporcionó una nueva URL de imagen y existía una antigua, eliminamos la antigua
    if (newImageUrl && existingImageUrl) {
        try {
            const oldImageName = path.basename(existingImageUrl);
            const oldImagePath = path.join(process.cwd(), 'public', 'images', oldImageName);
            
            if (await fs.pathExists(oldImagePath)) {
                await fs.unlink(oldImagePath);
                console.log(`Successfully deleted old image: ${oldImagePath}`);
            }
        } catch (error) {
            console.error('Failed to delete old image:', error);
        }
    }

    // 4. Guarda el producto en la base de datos
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

        await deleteProduct(productId);

        revalidatePath('/admin/products');
        revalidatePath('/shop');

        return { success: true };
    } catch(error) {
        console.error("Error in deleteProductAction:", error);
        return { success: false, error: "Failed to delete product." };
    }
}
