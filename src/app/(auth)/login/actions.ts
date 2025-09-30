'use server';

import { z } from 'zod';
import { getAllCustomers } from '@/lib/customers';
import type { SessionUser } from '@/lib/types';

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
    
    // 1. Comprobación de credenciales de Administrador
    if (username === 'admin' && password === 'password') {
        const adminUser: SessionUser = { id: 'admin', name: 'Admin', username: 'admin', role: 'admin' };
        return { user: adminUser };
    }

    // 2. Comprobación de credenciales de Cliente
    try {
        const customers = await getAllCustomers();
        const customer = customers.find(c => c.username === username);

        if (!customer) {
            return { user: null, error: 'Nombre de usuario o contraseña incorrectos.' };
        }

        // Simulación de validación de contraseña
        const isJuanPerez = customer.username === 'juanperez' && password === 'password123';
        const isOtherCustomer = customer.username !== 'juanperez' && password === 'password';

        if (isJuanPerez || isOtherCustomer) {
            const customerUser: SessionUser = { id: customer.id, name: customer.name, username: customer.username, role: 'customer' };
            return { user: customerUser };
        }

        return { user: null, error: 'Nombre de usuario o contraseña incorrectos.' };

    } catch (error) {
        console.error('Login action failed:', error);
        return { user: null, error: 'Ocurrió un error en el servidor.' };
    }
}
