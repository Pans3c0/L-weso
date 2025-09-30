'use client';

import * as React from 'react';
import type { PurchaseRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, Clock, CheckCircle, XCircle, Hourglass, TrafficCone } from 'lucide-react';
import { notifyDelayAction } from '@/app/(admin)/admin/requests/actions';
import { useNotifications } from '@/hooks/use-notifications';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea';


export default function NotificationsPage() {
  const { requests, isLoading, error, refetch } = useNotifications('customer_123');
  const { toast } = useToast();
  const [delayingRequest, setDelayingRequest] = React.useState<PurchaseRequest | null>(null);
  const [delayReason, setDelayReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const getStatusVariant = (status: PurchaseRequest['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: PurchaseRequest['status'], request: PurchaseRequest) => {
    if (status === 'confirmed' && request.customerNote) {
        return <TrafficCone className="h-4 w-4 mr-2 text-yellow-500" />;
    }
    switch (status) {
      case 'pending': return <Hourglass className="h-4 w-4 mr-2" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 mr-2" />;
      case 'rejected': return <XCircle className="h-4 w-4 mr-2" />;
      default: return <Clock className="h-4 w-4 mr-2" />;
    }
  };

  const getStatusText = (status: PurchaseRequest['status'], request: PurchaseRequest) => {
    if (status === 'confirmed' && request.customerNote) {
        return 'Retraso Notificado';
    }
    switch (status) {
        case 'pending': return 'Pendiente de confirmación';
        case 'confirmed': return 'Confirmado';
        case 'rejected': return 'Rechazado';
        default: return 'Desconocido';
    }
  }

  const handleNotifyDelay = async () => {
    if (!delayingRequest || !delayReason) return;
    setIsSubmitting(true);
    try {
        const result = await notifyDelayAction({ requestId: delayingRequest.id, customerNote: delayReason });
        if (result.success) {
            toast({ title: 'Retraso notificado', description: 'El vendedor ha sido informado sobre tu retraso.' });
            refetch();
        } else {
            throw new Error(result.error);
        }
    } catch (e) {
        toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
        setDelayingRequest(null);
        setDelayReason('');
    }
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl font-bold mb-8 flex items-center">
          <Bell className="w-8 h-8 mr-4" />
          Mis Notificaciones
        </h1>

        {isLoading && <p>Cargando notificaciones...</p>}
        {error && <p className="text-destructive">{error}</p>}
        
        {!isLoading && !error && requests.length === 0 && (
          <Card className="text-center py-20">
            <CardContent>
              <Bell className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Sin notificaciones</h2>
              <p className="text-muted-foreground">Aquí aparecerán las actualizaciones de tus solicitudes de compra.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && requests.length > 0 && (
          <div className="space-y-6">
            {requests.map(req => (
              <Card key={req.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className='mb-1'>Pedido #{req.id.slice(-6)}</CardTitle>
                      <CardDescription>
                        Realizado el {format(new Date(req.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(req.status)} className="capitalize flex items-center">
                      {getStatusIcon(req.status, req)}
                      {getStatusText(req.status, req)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground mb-4">
                    {req.items.map(item => (
                      <li key={item.product.id}>{item.product.name} ({(item.quantityInGrams/1000).toFixed(2)} kg)</li>
                    ))}
                  </ul>

                  {req.status === 'confirmed' && req.confirmationDate && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-800 dark:text-green-300">Confirmado para recogida/entrega</h4>
                      <p className="text-lg font-bold text-green-900 dark:text-green-200 mt-1">
                        {format(new Date(req.confirmationDate), "eeee, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                      </p>
                      {req.sellerNote && <p className="mt-2 text-sm text-green-700 dark:text-green-400">Nota del vendedor: "{req.sellerNote}"</p>}
                      {req.customerNote && <p className="mt-2 text-sm font-semibold text-yellow-700 dark:text-yellow-400">Tu nota de retraso: "{req.customerNote}"</p>}
                      
                      {!req.customerNote && !isPast(new Date(req.confirmationDate)) && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4"
                            onClick={() => setDelayingRequest(req)}
                        >
                            <TrafficCone className="w-4 h-4 mr-2" />
                            Notificar un retraso
                        </Button>
                      )}
                    </div>
                  )}

                  {req.status === 'pending' && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center"><Hourglass className="w-4 h-4 mr-2" />Tu solicitud está siendo revisada por el vendedor. Recibirás una notificación cuando sea confirmada.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

       <AlertDialog open={!!delayingRequest} onOpenChange={(isOpen) => !isOpen && setDelayingRequest(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Notificar un retraso</AlertDialogTitle>
            <AlertDialogDescription>
                Informa al vendedor por qué llegarás tarde. Esto le enviará una notificación.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
                <Textarea 
                    placeholder="Ej: 'Hola, voy con 15 minutos de retraso por el tráfico. ¡Gracias!'"
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                />
            </div>
            <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleNotifyDelay} disabled={!delayReason || isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Notificación'}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
