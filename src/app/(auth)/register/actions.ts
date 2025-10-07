'use server';

import { z } from 'zod';
import { 
    getAllCustomers, 
    saveCustomers, 
    associateCustomerWithSeller, 
    findReferralCode, 
    removeReferralCode 
} from '@/lib/db';
import type { Customer } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const RegisterCustomerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  referralCode: z.string().min(1, 'El código de referencia es obligatorio'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export async function registerCustomerAction(input: z.infer<typeof RegisterCustomerSchema>) {
  const parsedInput = RegisterCustomerSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Datos de registro inválidos.' };
  }

  const { name, username, referralCode, password } = parsedInput.data;

  const validCode = await findReferralCode(referralCode);
  if (!validCode) {
    return { error: 'El código de referencia no es válido o ya ha sido utilizado.' };
  }
  
  try {
    const allCustomers = await getAllCustomers();

    if (allCustomers.some(c => c.username === username)) {
        return { error: 'El nombre de usuario ya está en uso.' };
    }

    const newCustomer: Customer = {
      id: `customer_${Date.now()}`,
      name,
      username,
      password,
    };
    
    allCustomers.push(newCustomer);
    await saveCustomers(allCustomers);
    
    await associateCustomerWithSeller(newCustomer.id, validCode.sellerId);
    
    await removeReferralCode(referralCode);

    revalidatePath('/admin/customers');
    revalidatePath('/admin/referrals');

    return { success: true, customer: newCustomer };
  } catch (error) {
    console.error('Failed to register customer:', error);
    return { error: 'No se pudo completar el registro en el servidor.' };
  }
}
