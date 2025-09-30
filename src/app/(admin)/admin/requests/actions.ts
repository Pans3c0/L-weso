'use server';

import { z } from 'zod';
import { purchaseRequests, updateRequest } from '@/lib/requests';
import type { PurchaseRequest } from '@/lib/types';

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

    const success = updateRequest(updated);

    if (!success) {
      throw new Error('Failed to update request in data store.');
    }
    
    // In a real app, you would send a notification to the customer here.
    console.log(`Request ${requestId} confirmed for ${confirmationDate}.`);

    return { success: true, updatedRequest: updated };
  } catch (error) {
    console.error(`Failed to confirm request ${requestId}:`, error);
    return { error: 'No se pudo confirmar la solicitud.' };
  }
}
