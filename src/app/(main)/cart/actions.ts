'use server';

import { z } from 'zod';
<<<<<<< HEAD
import { getPurchaseRequests, savePurchaseRequests } from '@/lib/requests';
import type { CartItem, PurchaseRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { getAllCustomers } from '@/lib/customers';
=======
import { getPurchaseRequests, savePurchaseRequests, customers } from '@/lib/requests';
import type { CartItem, PurchaseRequest } from '@/lib/types';
>>>>>>> e4739d1 (La app me esta dando problemas durante su uso, ayudame a resolverlas. Te)

const ProductSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  name: z.string(),
  description: z.string(),
  pricePerGram: z.number(),
  stockInGrams: z.number(),
  imageUrl: z.string().optional().nullable(),
  imageHint: z.string().optional().nullable(),
  keywords: z.string().optional(),
});

const CartItemSchema = z.object({
  product: ProductSchema,
  quantityInGrams: z.number().positive(),
});

const PurchaseRequestSchema = z.object({
  customerId: z.string(),
  items: z.array(CartItemSchema).min(1, "El carrito no puede estar vacío."),
});

export async function submitPurchaseRequestAction(input: {
  customerId: string;
  items: CartItem[];
}) {
  const parsedInput = PurchaseRequestSchema.safeParse(input);
  if (!parsedInput.success) {
    console.error('Invalid purchase request input:', parsedInput.error);
    return { error: 'Datos de solicitud inválidos.' };
  }

  const { customerId, items } = parsedInput.data;

  // All items in a single cart must belong to the same seller.
  const sellerId = items[0]?.product.sellerId;
  if (!sellerId || !items.every(item => item.product.sellerId === sellerId)) {
    return { error: 'Todos los artículos del carrito deben pertenecer al mismo vendedor.' };
  }

  try {
    const customers = await getAllCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      return { error: 'Cliente no encontrado.' };
    }

    const total = items.reduce((acc, item) => acc + item.product.pricePerGram * item.quantityInGrams, 0);

    const newRequest: PurchaseRequest = {
      id: `req_${Date.now()}`,
      sellerId: sellerId, // Link request to the seller
      customerId,
      customerName: customer.name,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
<<<<<<< HEAD
    const allRequests = await getPurchaseRequests();
    allRequests.unshift(newRequest);
    await savePurchaseRequests(allRequests);
    
    revalidatePath(`/admin/requests`); // Revalidate for the specific seller
    revalidatePath(`/admin/customers`);

=======
    const allRequests = getPurchaseRequests();
    allRequests.unshift(newRequest);
    savePurchaseRequests(allRequests);
    
    console.log('New purchase request submitted:', newRequest);
    
>>>>>>> e4739d1 (La app me esta dando problemas durante su uso, ayudame a resolverlas. Te)
    return { success: true, requestId: newRequest.id };

  } catch (error) {
    console.error('Failed to submit purchase request:', error);
    return { error: 'No se pudo enviar la solicitud.' };
  }
}
