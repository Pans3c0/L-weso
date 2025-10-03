'use server';

import { z } from 'zod';
import { getAllSellers, saveSellers } from '@/lib/sellers';
import type { Seller } from '@/lib/types';

const RegisterSellerSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  storeName: z.string().min(3, 'El nombre de la tienda debe tener al menos 3 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  masterCode: z.string().min(1, 'El código maestro es obligatorio'),
});

/**
 * Server Action: Registers a new seller if the master code is correct.
 */
export async function registerSellerAction(input: z.infer<typeof RegisterSellerSchema>) {
  const parsedInput = RegisterSellerSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Datos de registro inválidos.' };
  }

  const { username, storeName, password, masterCode } = parsedInput.data;

  // Verify the master registration code against an environment variable
  const serverMasterCode = process.env.SELLER_REGISTRATION_CODE;
  if (!serverMasterCode || masterCode !== serverMasterCode) {
    return { error: 'El código maestro de registro no es válido.' };
  }
  
  try {
    const allSellers = await getAllSellers();

    // Check if username is already taken
    if (allSellers.some(s => s.username === username)) {
        return { error: 'El nombre de usuario ya está en uso.' };
    }
    // Check if store name is already taken
    if (allSellers.some(s => s.storeName.toLowerCase() === storeName.toLowerCase())) {
        return { error: 'El nombre de la tienda ya está en uso.' };
    }

    // Generate a new unique seller ID
    const newSellerId = `seller_${Date.now()}`;

    const newSeller: Seller = {
      id: newSellerId,
      username,
      storeName,
      passwordHash: password, // In a real app, hash this password
    };
    
    const updatedSellers = [...allSellers, newSeller];
    await saveSellers(updatedSellers);
    
    return { success: true, seller: newSeller };
  } catch (error) {
    console.error('Failed to register seller:', error);
    return { error: 'No se pudo completar el registro en el servidor.' };
  }
}
