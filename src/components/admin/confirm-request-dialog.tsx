'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PurchaseRequest } from '@/lib/types';
import { confirmRequestAction } from '@/app/(admin)/admin/requests/actions';
import { useToast } from '@/hooks/use-toast';

const confirmSchema = z.object({
  confirmationDate: z.date({
    required_error: 'La fecha de confirmación es obligatoria.',
  }),
  confirmationTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:mm)'),
  sellerNote: z.string().optional(),
});

type ConfirmFormValues = z.infer<typeof confirmSchema>;

interface ConfirmRequestDialogProps {
  request: PurchaseRequest | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedRequest: PurchaseRequest) => void;
<<<<<<< HEAD
  isEditing?: boolean;
}

export function ConfirmRequestDialog({ request, onOpenChange, onSuccess, isEditing = false }: ConfirmRequestDialogProps) {
=======
}

export function ConfirmRequestDialog({ request, onOpenChange, onSuccess }: ConfirmRequestDialogProps) {
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<ConfirmFormValues>({
    resolver: zodResolver(confirmSchema),
<<<<<<< HEAD
  });

  React.useEffect(() => {
    if (request) {
        const confirmationDate = request.confirmationDate ? new Date(request.confirmationDate) : new Date();
        form.reset({
            confirmationDate: confirmationDate,
            confirmationTime: format(confirmationDate, 'HH:mm'),
            sellerNote: request.sellerNote || '',
        });
    }
  }, [request, form]);
=======
    defaultValues: {
      confirmationDate: undefined,
      confirmationTime: '10:00',
      sellerNote: '',
    },
  });
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
  
  const isOpen = !!request;

  const onSubmit = async (data: ConfirmFormValues) => {
    if (!request) return;

    setIsSubmitting(true);
    const [hours, minutes] = data.confirmationTime.split(':').map(Number);
    const combinedDateTime = new Date(data.confirmationDate);
    combinedDateTime.setHours(hours, minutes);

    try {
      const result = await confirmRequestAction({
        requestId: request.id,
        confirmationDate: combinedDateTime.toISOString(),
        sellerNote: data.sellerNote,
<<<<<<< HEAD
        isEditing: isEditing, // Pass the flag to the action
=======
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
      });

      if (result.success && result.updatedRequest) {
        toast({
<<<<<<< HEAD
          title: isEditing ? 'Pedido Actualizado' : 'Solicitud Confirmada',
          description: isEditing 
            ? `Has actualizado el pedido de ${request.customerName}.`
            : `Has confirmado el pedido de ${request.customerName}.`,
        });
        onSuccess(result.updatedRequest);
=======
          title: 'Solicitud Confirmada',
          description: `Has confirmado el pedido de ${request.customerName}.`,
        });
        onSuccess(result.updatedRequest);
        form.reset();
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
      } else {
        throw new Error(result.error || 'Algo salió mal');
      }
    } catch (error) {
      toast({
<<<<<<< HEAD
        title: 'Error al guardar',
=======
        title: 'Error al confirmar',
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

<<<<<<< HEAD
  const title = isEditing ? 'Editar Pedido' : 'Confirmar Solicitud';
  const description = isEditing 
    ? `Ajusta la fecha, hora o nota para el pedido de ${request?.customerName}.`
    : `Establece la fecha y hora de recogida/entrega para el pedido de ${request?.customerName}.`;

=======
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
<<<<<<< HEAD
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
=======
          <DialogTitle>Confirmar Solicitud</DialogTitle>
          <DialogDescription>
            Establece la fecha y hora de recogida/entrega para el pedido de {request?.customerName}.
          </DialogDescription>
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="confirmationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
<<<<<<< HEAD
                          initialFocus
                          disabled={(date) => isEditing ? false : date < new Date(new Date().setHours(0,0,0,0))}
=======
                          disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                          initialFocus
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmationTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora (HH:mm)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sellerNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota para el Cliente (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Puedes pasar a recogerlo por la tarde." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
<<<<<<< HEAD
                {isEditing ? 'Guardar Cambios' : 'Confirmar Solicitud'}
=======
                Confirmar Solicitud
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
