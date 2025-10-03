'use client';

import * as React from 'react';
import type { PurchaseRequest } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { ConfirmRequestDialog } from '@/components/admin/confirm-request-dialog';
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';

export default function AdminRequestsPage() {
  const { session } = useSession();
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedRequest, setSelectedRequest] = React.useState<PurchaseRequest | null>(null);

  const fetchAndSetRequests = React.useCallback(async () => {
    if (!session?.sellerId) return;
    setIsLoading(true);
    try {
        const res = await fetch(`/api/requests?sellerId=${session.sellerId}`);
        if (!res.ok) throw new Error('Failed to fetch requests');
        const data = await res.json();
        setRequests(data.sort((a: PurchaseRequest, b: PurchaseRequest) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch(e) {
        console.error(e);
        toast({ title: 'Error', description: 'No se pudieron cargar las solicitudes.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  }, [session?.sellerId, toast]);

  React.useEffect(() => {
    fetchAndSetRequests();
  }, [fetchAndSetRequests]);
  
  const handleConfirmSuccess = (updatedRequest: PurchaseRequest) => {
    setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
    setSelectedRequest(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const getStatusVariant = (status: PurchaseRequest['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: PurchaseRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 mr-2" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 mr-2" />;
      case 'rejected': return <XCircle className="h-4 w-4 mr-2" />;
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');


  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Solicitudes de Compra</h1>
      </div>
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Nuevas Solicitudes</CardTitle>
          <CardDescription>
            {pendingRequests.length > 0
              ? `Tienes ${pendingRequests.length} ${pendingRequests.length === 1 ? 'nueva solicitud pendiente' : 'nuevas solicitudes pendientes'} de revisión.`
              : 'No hay solicitudes pendientes.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {pendingRequests.map(request => (
                <RequestItem
                  key={request.id}
                  request={request}
                  formatCurrency={formatCurrency}
                  getStatusVariant={getStatusVariant}
                  getStatusIcon={getStatusIcon}
                  onConfirmClick={() => setSelectedRequest(request)}
                />
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>Todo está al día.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className='mt-8'>
        <CardHeader>
          <CardTitle>Historial de Solicitudes</CardTitle>
          <CardDescription>Solicitudes ya procesadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {processedRequests.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {processedRequests.map(request => (
                <RequestItem
                  key={request.id}
                  request={request}
                  formatCurrency={formatCurrency}
                  getStatusVariant={getStatusVariant}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No hay solicitudes procesadas todavía.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmRequestDialog 
        request={selectedRequest}
        onOpenChange={(isOpen) => !isOpen && setSelectedRequest(null)}
        onSuccess={handleConfirmSuccess}
      />
    </>
  );
}

function RequestItem({
  request,
  formatCurrency,
  getStatusVariant,
  getStatusIcon,
  onConfirmClick,
}: {
  request: PurchaseRequest;
  formatCurrency: (amount: number) => string;
  getStatusVariant: (status: PurchaseRequest['status']) => 'secondary' | 'default' | 'destructive' | 'outline';
  getStatusIcon: (status: PurchaseRequest['status']) => React.ReactNode;
  onConfirmClick?: () => void;
}) {
  const placeholderImageUrl = 'https://placehold.co/64x64/F5F5F5/696969?text=?';
  return (
    <AccordionItem value={request.id}>
      <AccordionTrigger>
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex flex-col sm:flex-row sm:items-center text-left">
            <span className="font-semibold mr-4">{request.customerName}</span>
            <span className="text-sm text-muted-foreground">
              {format(new Date(request.createdAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-4 font-bold">{formatCurrency(request.total)}</span>
            <Badge variant={getStatusVariant(request.status)} className="capitalize flex items-center">
                {getStatusIcon(request.status)}
                {request.status === 'pending' ? 'Pendiente' : request.status === 'confirmed' ? 'Confirmada' : 'Rechazada'}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="px-4 py-2 bg-muted/50 rounded-md">
          <h4 className="font-semibold mb-2">Detalles del Pedido:</h4>
          <ul className="space-y-2 mb-4">
            {request.items.map(item => (
              <li key={item.product.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image
                    src={item.product.imageUrl || placeholderImageUrl}
                    alt={item.product.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover mr-3"
                    data-ai-hint={item.product.imageHint}
                  />
                  <span>{item.product.name}</span>
                </div>
                <span>{item.quantityInGrams} g</span>
              </li>
            ))}
          </ul>
          
          {request.customerNote && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-3 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                    Nota del Cliente (Retraso):
                </p>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">"{request.customerNote}"</p>
              </div>
            </div>
          )}

          {request.status === 'confirmed' && request.confirmationDate && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 rounded-md">
                <p className="font-semibold text-green-800 dark:text-green-300">
                    Confirmado para: {format(new Date(request.confirmationDate), "eeee, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                </p>
                {request.sellerNote && <p className="mt-1 text-sm text-green-700 dark:text-green-400">Nota: "{request.sellerNote}"</p>}
            </div>
          )}
          {onConfirmClick && request.status === 'pending' && (
            <div className="text-right">
              <Button onClick={onConfirmClick}>Revisar y Confirmar</Button>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
