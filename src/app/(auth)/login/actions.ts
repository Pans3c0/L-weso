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
    
    let redirectTo: string | null = null;
    let userToLogin: SessionUser | null = null;
    let loginError: string | null = null;
    
    try {
        // 1. Comprobación de credenciales de Administrador
        if (username === 'admin' && password === 'password') {
            userToLogin = { id: 'admin', name: 'Admin', username: 'admin', role: 'admin' };
            redirectTo = '/admin/dashboard';
        } else {
            // 2. Comprobación de credenciales de Cliente
            const customers = await getAllCustomers();
            const customer = customers.find(c => c.username === username);

            if (customer) {
                const isJuanPerez = customer.username === 'juanperez' && password === 'password123';
                const isOtherCustomer = customer.username !== 'juanperez' && password === 'password';

                if (isJuanPerez || isOtherCustomer) {
                    userToLogin = { id: customer.id, name: customer.name, username: customer.username, role: 'customer' };
                    redirectTo = '/shop';
                }
            }
        }
        
        if (!userToLogin) {
            loginError = 'Nombre de usuario o contraseña incorrectos.';
        }
        
    } catch (error) {
        console.error('Login action failed:', error);
        loginError = 'Ocurrió un error en el servidor.';
    }

    // --- Redirección y retorno ---
    // La redirección debe ocurrir fuera del bloque try/catch.
    if (redirectTo && userToLogin) {
        // Aunque el redirect detiene la ejecución, necesitamos devolver algo para satisfacer TypeScript.
        // Pero esta línea nunca se alcanzará si la redirección tiene éxito.
        redirect(redirectTo);
    }
    
    // Si llegamos aquí, significa que hubo un error o no se redirigió.
    return { user: null, error: loginError || 'Error desconocido' };
}
