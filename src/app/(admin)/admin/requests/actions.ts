'use server';

import { z } from 'zod';
import { getPurchaseRequestById, updateRequest } from '@/lib/requests';
import type { PurchaseRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { sendPushNotification } from '@/lib/push';

/**
 * Schema for validating the input for the confirmation action.
 */
const ConfirmRequestSchema = z.object({
  requestId: z.string(),
  confirmationDate: z.string().datetime(),
  sellerNote: z.string().optional(),
  isEditing: z.boolean().optional(), // Add isEditing flag
});

/**
 * Server Action: Confirms a pending purchase request or updates a confirmed one.
 * This action finds the request, updates its status/details,
 * and saves the new state. It also revalidates relevant paths.
 * @param input - The details for the confirmation, including request ID, date, and an optional note.
 * @returns A success object with the updated request or an error object.
 */
export async function confirmRequestAction(input: z.infer<typeof ConfirmRequestSchema>) {
  const parsedInput = ConfirmRequestSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Datos de confirmación inválidos.' };
  }

  const { requestId, confirmationDate, sellerNote, isEditing } = parsedInput.data;
  
  try {
    const request = await getPurchaseRequestById(requestId);
    if (!request) {
      return { error: 'Solicitud no encontrada.' };
    }

    // Allow updates only on pending requests OR if we are explicitly editing a confirmed one
    if (request.status !== 'pending' && !isEditing) {
      return { error: 'Esta solicitud ya ha sido procesada.' };
    }
     if (isEditing && request.status !== 'confirmed') {
      return { error: 'Solo se pueden editar pedidos que ya están confirmados.' };
    }


    const updated: PurchaseRequest = {
      ...request,
      status: 'confirmed', // Keep status as confirmed
      confirmationDate,
      sellerNote,
    };

    await updateRequest(updated);
    
    // Send a push notification to the customer if this is a new confirmation
    if (!isEditing) {
       await sendPushNotification(request.customerId, {
        title: '¡Tu pedido ha sido confirmado!',
        body: `Tu pedido de ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(request.total)} ha sido confirmado.`,
        url: '/notifications'
      });
    }

    // Revalidate paths to update UI across the app
    revalidatePath('/admin/requests');
    revalidatePath('/admin/orders');
    revalidatePath('/notifications'); // For the customer

    return { success: true, updatedRequest: updated };
  } catch (error) {
    console.error(`Failed to process request ${requestId}:`, error);
    return { error: 'No se pudo procesar la solicitud.' };
  }
}

/**
 * Schema for validating the input for the delay notification action.
 */
const NotifyDelaySchema = z.object({
  requestId: z.string(),
  customerNote: z.string().min(1, "La nota no puede estar vacía."),
});

/**
 * Server Action: Allows a customer to notify the seller about a delay.
 * This action adds a `customerNote` to a confirmed request.
 * @param input - Contains the request ID and the note from the customer.
 * @returns A success object with the updated request or an error object.
 */
export async function notifyDelayAction(input: z.infer<typeof NotifyDelaySchema>) {
  const parsedInput = NotifyDelaySchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Datos inválidos.' };
  }

  const { requestId, customerNote } = parsedInput.data;

  try {
    const request = await getPurchaseRequestById(requestId);
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

    await updateRequest(updated);
    
    // Notify the seller about the customer's delay
    await sendPushNotification(request.sellerId, {
      title: 'Retraso notificado por un cliente',
      body: `El cliente ${request.customerName} ha notificado un retraso para el pedido #${request.id.slice(-6)}.`,
      url: `/admin/orders`
    });

    // Revalidate paths to ensure UI is up-to-date for both admin and customer.
    revalidatePath('/admin/orders');
    revalidatePath('/notifications');

    return { success: true, updatedRequest: updated };
  } catch (error) {
    console.error(`Failed to notify delay for request ${requestId}:`, error);
    return { error: 'No se pudo notificar el retraso.' };
  }
}

/**
 * Server Action: Sends a test notification to a specific user.
 * @param userId - The ID of the user to send the notification to.
 * @returns A success or error object.
 */
export async function sendTestNotificationAction(userId: string) {
    try {
        await sendPushNotification(userId, {
            title: "¡Bienvenido a Mercado Vecinal!",
            body: "Ahora recibirás notificaciones importantes.",
            url: "/"
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send test notification:", error);
        return { error: 'Failed to send test notification.' };
    }
}
