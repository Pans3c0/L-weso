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
        // 1. Comprobación de credenciales de Administrador
        if (username === 'admin' && password === 'password') {
            const adminUser: SessionUser = { id: 'admin', name: 'Admin', username: 'admin', role: 'admin' };
            return { user: adminUser };
        }
        
        // 2. Comprobación de credenciales de Cliente
        const customers = await getAllCustomers();
        const customer = customers.find(c => c.username === username);

        if (customer) {
            // Lógica de contraseña simplificada y corregida
            const isValidPassword = 
                (customer.username === 'juanperez' && password === 'password123') ||
                (customer.username !== 'juanperez' && password === 'password');

            if (isValidPassword) {
                const customerUser: SessionUser = { id: customer.id, name: customer.name, username: customer.username, role: 'customer' };
                return { user: customerUser };
            }
        }
        
        // Si no se encontró ningún usuario o la contraseña es incorrecta
        return { user: null, error: 'Nombre de usuario o contraseña incorrectos.' };
        
    } catch (error) {
        console.error('Login action failed:', error);
        return { user: null, error: 'Ocurrió un error en el servidor.' };
    }
}
