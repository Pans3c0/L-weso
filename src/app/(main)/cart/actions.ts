'use server';

import { z } from 'zod';
import { getPurchaseRequests, savePurchaseRequests, getCustomerById } from '@/lib/db';
import type { CartItem, PurchaseRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { sendPushNotification } from '@/lib/push';

const ProductSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  name: z.string(),
  description: z.string(),
  pricePerGram: z.number(),
  stockInGrams: z.number(),
  imageUrl: z.string().optional().nullable(),
  imageHint: z.string().optional().nullable(),
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

  const sellerId = items[0]?.product.sellerId;
  if (!sellerId || !items.every(item => item.product.sellerId === sellerId)) {
    return { error: 'Todos los artículos del carrito deben pertenecer al mismo vendedor.' };
  }

  try {
    const customer = await getCustomerById(customerId);
    if (!customer) {
      return { error: 'Cliente no encontrado.' };
    }

    const total = items.reduce((acc, item) => acc + item.product.pricePerGram * item.quantityInGrams, 0);

    const newRequest: PurchaseRequest = {
      id: `req_${Date.now()}`,
      sellerId: sellerId,
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
    
    await sendPushNotification(sellerId, {
      title: '¡Nueva solicitud de compra!',
      body: `Has recibido una nueva solicitud de ${customer.name} por un total de ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total)}.`,
      url: '/admin/requests'
    });
    
    revalidatePath(`/admin/requests`);
    revalidatePath(`/admin/customers`);

    return { success: true, requestId: newRequest.id };

  } catch (error) {
    console.error('Failed to submit purchase request:', error);
    return { error: 'No se pudo enviar la solicitud.' };
  }
}
