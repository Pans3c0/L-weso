'use server';

import { z } from 'zod';
import { getPurchaseRequests, savePurchaseRequests, customers } from '@/lib/requests';
import type { CartItem, PurchaseRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Simplified product schema for validation
const ProductSchema = z.object({
  id: z.string(),
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
  items: z.array(CartItemSchema),
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

  try {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      return { error: 'Cliente no encontrado.' };
    }

    const total = items.reduce((acc, item) => acc + item.product.pricePerGram * item.quantityInGrams, 0);

    const newRequest: PurchaseRequest = {
      id: `req_${Date.now()}`,
      customerId,
      customerName: customer.name,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    const allRequests = await getPurchaseRequests();
    allRequests.unshift(newRequest);
    await savePurchaseRequests(allRequests);
    
    console.log('New purchase request submitted:', newRequest);
    
    revalidatePath('/admin/requests');
    revalidatePath('/notifications');

    return { success: true, requestId: newRequest.id };

  } catch (error) {
    console.error('Failed to submit purchase request:', error);
    return { error: 'No se pudo enviar la solicitud.' };
  }
}
