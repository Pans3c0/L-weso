'use server';

import { z } from 'zod';
import { getAllCustomers } from '@/lib/customers';
import type { SessionUser } from '@/lib/types';
import { redirect } from 'next/navigation';

const LoginSchema = z.object({
    username: z.string(),
    password: z.string(),
});

export async function loginAction(input: z.infer<typeof LoginSchema>): Promise<{ user: SessionUser | null, error?: string }> {
    const parsedInput = LoginSchema.safeParse(input);
    if (!parsedInput.success) {
        return { user: null, error: 'Datos de inicio de sesión inválidos.' };
    }

    const { username, password } = parsedInput.data;
    
    try {
        // 1. Admin Check
        if (username === 'admin' && password === 'password') {
            const adminUser: SessionUser = { id: 'admin', name: 'Admin', username: 'admin', role: 'admin' };
            return { user: adminUser };
        }
        
        // 2. Customer Check
        const customers = await getAllCustomers();
        const customer = customers.find(c => c.username === username);

        if (customer) {
            let isValidPassword = false;
            // Specific password for juanperez
            if (customer.username === 'juanperez') {
                isValidPassword = (password === 'password123');
            } else {
                // Default password for all other customers
                isValidPassword = (password === 'password');
            }

            if (isValidPassword) {
                const customerUser: SessionUser = { id: customer.id, name: customer.name, username: customer.username, role: 'customer' };
                return { user: customerUser };
            }
        }
        
        // If no user was found or password was incorrect
        return { user: null, error: 'Nombre de usuario o contraseña incorrectos.' };
        
    } catch (error) {
        console.error('Login action failed:', error);
        return { user: null, error: 'Ocurrió un error en el servidor.' };
    }
}
