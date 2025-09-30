'use server';

import { z } from 'zod';
<<<<<<< HEAD
import { getPurchaseRequests, savePurchaseRequests } from '@/lib/requests';
import type { CartItem, PurchaseRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { getAllCustomers } from '@/lib/customers';

/**
 * Schema for validating a product object within a cart.
 * Simplified to what's necessary for creating a purchase request.
 */
=======
import { purchaseRequests, customers } from '@/lib/requests';
import type { CartItem, PurchaseRequest, Product } from '@/lib/types';

// Simplified product schema for validation
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  pricePerGram: z.number(),
  stockInGrams: z.number(),
<<<<<<< HEAD
  imageUrl: z.string().optional().nullable(),
  imageHint: z.string().optional().nullable(),
  keywords: z.string().optional(),
});

/**
 * Schema for validating a single item in the cart.
 */
=======
  imageUrl: z.string(),
  imageHint: z.string(),
  keywords: z.string().optional(),
});


>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
const CartItemSchema = z.object({
  product: ProductSchema,
  quantityInGrams: z.number().positive(),
});

<<<<<<< HEAD
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
=======
const PurchaseRequestSchema = z.object({
  customerId: z.string(),
  items: z.array(CartItemSchema),
});

>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
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
<<<<<<< HEAD
    const customers = await getAllCustomers();
=======
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
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
<<<<<<< HEAD
    
    const allRequests = await getPurchaseRequests();
    allRequests.unshift(newRequest);
    await savePurchaseRequests(allRequests);
    
    console.log('New purchase request submitted:', newRequest.id);
    
    // Revalidate paths to update the UI for administrators.
    revalidatePath('/admin/requests');
    revalidatePath('/admin/customers');

=======

    // In a real app, this would be a database insert.
    purchaseRequests.unshift(newRequest); 
    
    console.log('New purchase request submitted:', newRequest);
    
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
    return { success: true, requestId: newRequest.id };

  } catch (error) {
    console.error('Failed to submit purchase request:', error);
    return { error: 'No se pudo enviar la solicitud.' };
  }
}
