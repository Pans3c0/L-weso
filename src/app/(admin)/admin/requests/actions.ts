'use server';

import { z } from 'zod';
import { getPurchaseRequests, updateRequest } from '@/lib/requests';
import type { PurchaseRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const ConfirmRequestSchema = z.object({
  requestId: z.string(),
  confirmationDate: z.string().datetime(),
  sellerNote: z.string().optional(),
});

export async function confirmRequestAction(input: z.infer<typeof ConfirmRequestSchema>) {
  const parsedInput = ConfirmRequestSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Datos de confirmación inválidos.' };
  }

  const { requestId, confirmationDate, sellerNote } = parsedInput.data;
  
  const purchaseRequests = await getPurchaseRequests();

  try {
    const request = purchaseRequests.find(r => r.id === requestId);
    if (!request) {
      return { error: 'Solicitud no encontrada.' };
    }

    if (request.status !== 'pending') {
      return { error: 'Esta solicitud ya ha sido procesada.' };
    }

    const updated: PurchaseRequest = {
      ...request,
      status: 'confirmed',
      confirmationDate,
      sellerNote,
    };

    const success = await updateRequest(updated);

    if (!success) {
      throw new Error('Failed to update request in data store.');
    }
    
    // In a real app, you would send a notification to the customer here.
    console.log(`Request ${requestId} confirmed for ${confirmationDate}.`);

    revalidatePath('/admin/requests');
    revalidatePath('/notifications');
    revalidatePath('/admin/orders');

    return { success: true, updatedRequest: updated };
  } catch (error) {
    console.error(`Failed to confirm request ${requestId}:`, error);
    return { error: 'No se pudo confirmar la solicitud.' };
  }
}

const NotifyDelaySchema = z.object({
  requestId: z.string(),
  customerNote: z.string(),
});

export async function notifyDelayAction(input: z.infer<typeof NotifyDelaySchema>) {
  const parsedInput = NotifyDelaySchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Datos inválidos.' };
  }

  const { requestId, customerNote } = parsedInput.data;

  const purchaseRequests = await getPurchaseRequests();

  try {
    const request = purchaseRequests.find(r => r.id === requestId);
    if (!request) {
      return { error: 'Solicitud no encontrada.' };
    }

    if (request.status !== 'confirmed') {
      return { error: 'Solo se pueden notificar retrasos en pedidos confirmados.' };
    }

    const updated: PurchaseRequest = {
      ...request,
      customerNote,
    };

    const success = await updateRequest(updated);

    if (!success) {
      throw new Error('Failed to update request in data store.');
    }
    
    console.log(`Delay notified for request ${requestId}.`);

    revalidatePath('/admin/requests');
    revalidatePath('/notifications');
    revalidatePath('/admin/orders');


    return { success: true, updatedRequest: updated };
  } catch (error) {
    console.error(`Failed to notify delay for request ${requestId}:`, error);
    return { error: 'No se pudo notificar el retraso.' };
  }
}
