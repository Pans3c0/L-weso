'use server';

import { z } from "zod";
import { getAllCustomers, getAllSellers } from "@/lib/db";
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
    const sellers = await getAllSellers();
    const seller = sellers.find(s => s.username === username);

    if (seller && seller.passwordHash === password) { 
      const adminUser: SessionUser = {
        id: seller.id,
        name: seller.username,
        username: seller.username,
        role: "admin",
        sellerId: seller.id,
      };
      return { user: adminUser };
    }

    const customers = await getAllCustomers();
    const customer = customers.find((c) => c.username === username);

    if (customer && customer.password === password) {
      const customerUser: SessionUser = {
        id: customer.id,
        name: customer.name,
        username: customer.username,
        role: "customer",
      };
      return { user: customerUser };
    }

    return { user: null, error: "Nombre de usuario o contraseña incorrectos." };
  } catch (error) {
    console.error("Login action failed:", error);
    return { user: null, error: "Ocurrió un error en el servidor." };
  }
}
