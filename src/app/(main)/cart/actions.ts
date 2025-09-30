'use server';

import { z } from 'zod';
import { getPurchaseRequests, savePurchaseRequests } from '@/lib/requests';
import type { CartItem, PurchaseRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { customers } from '@/lib/mock-data';

/**
 * Schema for validating a product object within a cart.
 * Simplified to what's necessary for creating a purchase request.
 */
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

/**
 * Schema for validating a single item in the cart.
 */
const CartItemSchema = z.object({
  product: ProductSchema,
  quantityInGrams: z.number().positive(),
});

/**
 * Schema for validating the input for submitting a new purchase request.
 */
const PurchaseRequestSchema = z.object({
  customerId: z.string(),
  items: z.array(CartItemSchema).min(1, "El carrito no puede estar vacío."),
});

/**
 * Server Action: Submits a new purchase request from a customer's cart.
 * This function creates a new request record with a 'pending' status.
 * @param input - An object containing the customer ID and the array of cart items.
 * @returns An object indicating success with the new request ID, or an error object.
 */
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
    
    console.log('New purchase request submitted:', newRequest.id);
    
    // Revalidate paths to update the UI for administrators.
    revalidatePath('/admin/requests');
    revalidatePath('/admin-sidebar'); // To update the pending count badge

    return { success: true, requestId: newRequest.id };

  } catch (error) {
    console.error('Failed to submit purchase request:', error);
    return { error: 'No se pudo enviar la solicitud.' };
  }
}
