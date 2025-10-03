'use server';

import { z } from 'zod';
import { getAllCustomers, saveCustomers, associateCustomerWithSeller } from '@/lib/customers';
import { findReferralCode, removeReferralCode } from '@/lib/referral-codes';
import type { Customer } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const RegisterCustomerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  referralCode: z.string().min(1, 'El código de referencia es obligatorio'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

/**
 * Server Action: Registers a new customer using a single-use referral code.
 * This function validates the referral code, finds the associated seller,
 * creates a new customer linked to that seller, saves them,
 * and then invalidates the referral code.
 */
export async function registerCustomerAction(input: z.infer<typeof RegisterCustomerSchema>) {
  const parsedInput = RegisterCustomerSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Datos de registro inválidos.' };
  }

  const { name, username, referralCode, password } = parsedInput.data;

  // Find the referral code and its associated seller
  const validCode = await findReferralCode(referralCode);
  if (!validCode) {
    return { error: 'El código de referencia no es válido o ya ha sido utilizado.' };
  }
  
  try {
    const allCustomers = await getAllCustomers();

    // Check if username is already taken
    if (allCustomers.some(c => c.username === username)) {
        return { error: 'El nombre de usuario ya está en uso.' };
    }

    const newCustomer: Customer = {
      id: `customer_${Date.now()}`,
      name,
      username,
      password, // In a real app, hash this password
    };
    
    const updatedCustomers = [...allCustomers, newCustomer];
    await saveCustomers(updatedCustomers);
    
    // Create the initial association between the new customer and the seller
    await associateCustomerWithSeller(newCustomer.id, validCode.sellerId);
    
    // Invalidate the referral code so it cannot be used again
    await removeReferralCode(referralCode);

    revalidatePath('/admin/customers');
    revalidatePath('/admin/referrals');

    return { success: true, customer: newCustomer };
  } catch (error) {
    console.error('Failed to register customer:', error);
    return { error: 'No se pudo completar el registro en el servidor.' };
  }
}
