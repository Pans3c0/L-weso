'use server';

import { z } from "zod";
import { getAllCustomers } from "@/lib/customers";
import { getAllSellers } from "@/lib/sellers";
import type { SessionUser } from "@/lib/types";

const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function loginAction(
  input: z.infer<typeof LoginSchema>
): Promise<{ user: SessionUser | null; error?: string }> {
  const parsedInput = LoginSchema.safeParse(input);
  if (!parsedInput.success) {
    return { user: null, error: "Datos de inicio de sesión inválidos." };
  }

  const { username, password } = parsedInput.data;

  try {
    // 1. Admin Check
    const sellers = await getAllSellers();
    const seller = sellers.find(s => s.username === username);

    if (seller && seller.passwordHash === password) { // In a real app, use bcrypt.compare
      const adminUser: SessionUser = {
        id: seller.id, // The user ID for an admin is their sellerId
        name: seller.username, // Display username as name
        username: seller.username,
        role: "admin",
        sellerId: seller.id, // Explicitly set sellerId for admin session
      };
      return { user: adminUser };
    }

    // 2. Customer Check
    const customers = await getAllCustomers();
    const customer = customers.find((c) => c.username === username);

    if (customer && customer.password === password) { // In a real app, use bcrypt.compare
      const customerUser: SessionUser = {
        id: customer.id,
        name: customer.name,
        username: customer.username,
        role: "customer",
        // sellerId is not needed for customer session, as their context is determined by their actions (e.g., which shop they visit)
      };
      return { user: customerUser };
    }

    // If no user was found or password was incorrect
    return { user: null, error: "Nombre de usuario o contraseña incorrectos." };
  } catch (error) {
    console.error("Login action failed:", error);
    return { user: null, error: "Ocurrió un error en el servidor." };
  }
}
