'use server';

import { z } from 'zod';
import { getPurchaseRequestById, updateRequest } from '@/lib/db';
import type { PurchaseRequest } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { sendPushNotification } from '@/lib/push';

const ConfirmRequestSchema = z.object({
  requestId: z.string(),
  confirmationDate: z.string().datetime(),
  sellerNote: z.string().optional(),
  isEditing: z.boolean().optional(),
});

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

    if (!isEditing && request.status !== 'pending') {
      return { error: 'Esta solicitud ya ha sido procesada.' };
    }
     if (isEditing && request.status !== 'confirmed') {
      return { error: 'Solo se pueden editar pedidos que ya están confirmados.' };
    }

    const updated: PurchaseRequest = {
      ...request,
      status: 'confirmed',
      confirmationDate,
      sellerNote,
    };

    await updateRequest(updated);
    
    if (isEditing) {
      await sendPushNotification(request.customerId, {
        title: 'Tu pedido ha sido actualizado',
        body: `El vendedor ha modificado los detalles de tu pedido #${request.id.slice(-6)}.`,
        url: '/notifications'
      });
    } else {
       await sendPushNotification(request.customerId, {
        title: '¡Tu pedido ha sido confirmado!',
        body: `Tu pedido #${request.id.slice(-6)} ha sido confirmado.`,
        url: '/notifications'
      });
    }

    revalidatePath('/admin/requests');
    revalidatePath('/admin/orders');
    revalidatePath('/notifications');

    return { success: true, updatedRequest: updated };
  } catch (error) {
    console.error(`Failed to process request ${requestId}:`, error);
    return { error: 'No se pudo procesar la solicitud.' };
  }
}

const NotifyDelaySchema = z.object({
  requestId: z.string(),
  customerNote: z.string().min(1, "La nota no puede estar vacía."),
});

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
    
    // Notify seller about the delay
    await sendPushNotification(request.sellerId, {
      title: 'Retraso notificado por cliente',
      body: `Cliente: ${request.customerName} ha notificado un retraso para el pedido #${request.id.slice(-6)}.`,
      url: `/admin/orders`
    });

    revalidatePath('/admin/orders');
    revalidatePath('/notifications');

    return { success: true, updatedRequest: updated };
  } catch (error) {
    console.error(`Failed to notify delay for request ${requestId}:`, error);
    return { error: 'No se pudo notificar el retraso.' };
  }
}

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

const EmergencyNotificationSchema = z.object({
  senderId: z.string(),
  senderName: z.string(),
});

export async function sendEmergencyNotificationAction(input: z.infer<typeof EmergencyNotificationSchema>) {
  const parsedInput = EmergencyNotificationSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Datos inválidos.' };
  }

  const { senderName } = parsedInput.data;
  const masterAdminId = 'seller_1';

  try {
    await sendPushNotification(masterAdminId, {
      title: "¡ALERTA DE EMERGENCIA RECIBIDA!",
      body: `Activada por ${senderName}. Ponte en contacto con el usuario de inmediato.`,
      url: "/admin/dashboard"
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send emergency notification:", error);
    return { error: 'No se pudo enviar la alerta de emergencia.' };
  }
}
