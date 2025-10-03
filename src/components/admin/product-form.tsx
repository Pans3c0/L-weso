'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { improveDescriptionAction } from '@/app/(admin)/admin/products/actions';
import { Loader2, Sparkles } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre es obligatorio'),
  description: z.string().min(10, 'La descripción es obligatoria'),
  pricePerGram: z.coerce.number().positive('El precio debe ser un número positivo'),
  stockInGrams: z.coerce.number().int().nonnegative('El stock debe ser un número entero no negativo'),
  imageUrl: z.string().url('Debe ser una URL válida o estar vacío').optional().or(z.literal('')),
  imageHint: z.string().optional(),
  keywords: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSave: (data: Product) => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const [isImproving, setIsImproving] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      pricePerGram: product?.pricePerGram || 0,
      stockInGrams: product?.stockInGrams || 0,
      imageUrl: product?.imageUrl || '',
      imageHint: product?.imageHint || '',
      keywords: product?.keywords || '',
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsSaving(true);
    const finalData: Product = {
        ...data,
        id: product?.id || '', // ID will be set by parent component for new products
        imageUrl: data.imageUrl || '',
    }
    await onSave(finalData);
    setIsSaving(false);
  };
  
  const handleImproveDescription = async () => {
    setIsImproving(true);
    const keywords = form.getValues('keywords') || '';
    const description = form.getValues('description');
    
    try {
      const result = await improveDescriptionAction({ keywords, existingDescription: description });
      if (result.improvedDescription) {
        form.setValue('description', result.improvedDescription, { shouldValidate: true });
        toast({ title: 'Descripción mejorada', description: 'La IA ha generado una nueva descripción para tu producto.' });
      } else if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo mejorar la descripción.', variant: 'destructive' });
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 overflow-y-auto max-h-[calc(100vh-10rem)] pr-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Producto</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Palabras Clave (separadas por comas)</FormLabel>
              <FormControl><Input placeholder="ej: fresco, orgánico, local" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Descripción</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={handleImproveDescription} disabled={isImproving}>
                  {isImproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span className='ml-2'>Mejorar con IA</span>
                </Button>
              </div>
              <FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="pricePerGram"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Precio por Gramo (€)</FormLabel>
                <FormControl><Input type="number" step="0.001" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="stockInGrams"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Stock (gramos)</FormLabel>
                <FormControl><Input type="number" step="1" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la Imagen</FormLabel>
              <FormControl><Input placeholder="https://ejemplo.com/imagen.jpg" {...field} /></FormControl>
              <FormDescription>
                Pega aquí el enlace a una imagen del producto que esté en internet.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar Producto
            </Button>
        </div>
      </form>
    </Form>
  );
}
