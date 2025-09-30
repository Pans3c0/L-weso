'use server';

import { z } from 'zod';
import { getAllCustomers, saveCustomers } from '@/lib/customers';
import type { Customer } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const RegisterCustomerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  referralCode: z.string().min(1, 'El código de referencia es obligatorio'),
  // Password is not saved, but validated
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

/**
 * Server Action: Registers a new customer.
 * This function validates the referral code, creates a new customer record,
 * and saves it to the customers data source.
 * @param input - The customer's registration data (name, referral code).
 * @returns A success object or an error object.
 */
export async function registerCustomerAction(input: z.infer<typeof RegisterCustomerSchema>) {
  const parsedInput = RegisterCustomerSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Datos de registro inválidos.' };
  }

  const { name, username, referralCode } = parsedInput.data;

  // In a real app, you would have a list of valid referral codes in a database.
  // Here, we'll just check against the hardcoded admin code for simplicity.
  const ADMIN_REFERRAL_CODE = 'tienda_admin';
  if (referralCode !== ADMIN_REFERRAL_CODE) {
    return { error: 'El código de referencia no es válido.' };
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
      referralCode,
    };
    
    const updatedCustomers = [...allCustomers, newCustomer];
    await saveCustomers(updatedCustomers);
    
    // Revalidate the customers page in the admin panel to show the new user
    revalidatePath('/admin/customers');

    return { success: true, customer: newCustomer };
  } catch (error) {
    console.error('Failed to register customer:', error);
    return { error: 'No se pudo completar el registro en el servidor.' };
  }
}
