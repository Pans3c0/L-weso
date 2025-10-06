'use client';

import * as React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/lib/types';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveProductAction } from '@/app/(admin)/admin/products/actions';
import { useSession } from '@/hooks/use-session';
import imageCompression from 'browser-image-compression';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre es obligatorio'),
  description: z.string().min(10, 'La descripción es obligatoria'),
  pricePerGram: z.coerce.number().positive('El precio debe ser un número positivo'),
  stockInGrams: z.coerce.number().int().nonnegative('El stock debe ser un número entero no negativo'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const { session } = useSession();
  const [isSaving, setIsSaving] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const getImageUrl = (url: string) => {
    if (!url) return null;
    // If it's a local image, serve it through the API route
    if (url.startsWith('/images/')) {
      return `/api${url}`;
    }
    // Otherwise, it's an external URL (e.g., from seeding)
    return url;
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      pricePerGram: product?.pricePerGram || 0,
      stockInGrams: product?.stockInGrams || 0,
    },
  });

  React.useEffect(() => {
    form.reset({
      name: product?.name || '',
      description: product?.description || '',
      pricePerGram: product?.pricePerGram || 0,
      stockInGrams: product?.stockInGrams || 0,
    });
    setImagePreview(product?.imageUrl ? getImageUrl(product.imageUrl) : null);
    setImageFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, form]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSaving(true);
    if (!session?.sellerId) {
      toast({ title: 'Error', description: 'No se pudo identificar al vendedor.', variant: 'destructive' });
      setIsSaving(false);
      return;
    }

    let newImageUrl: string | undefined = undefined;

    // 1. Si hay un nuevo archivo de imagen, súbelo primero
    if (imageFile) {
      try {
        const imageFormData = new FormData();
        imageFormData.append('imageFile', imageFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Error al subir la imagen');
        }
        newImageUrl = result.url;
      } catch (uploadError) {
        toast({ title: 'Error de subida', description: (uploadError as Error).message, variant: 'destructive' });
        setIsSaving(false);
        return;
      }
    }

    // 2. Llama a la Server Action con los datos del formulario y la URL de la nueva imagen
    const result = await saveProductAction({
      ...data,
      id: product?.id,
      sellerId: session.sellerId,
      newImageUrl: newImageUrl,
      existingImageUrl: product?.imageUrl,
    });

    if (result.success) {
      toast({ title: 'Producto guardado', description: `El producto ha sido guardado.` });
      await onSave();
    } else {
       toast({ title: 'Error al guardar', description: result.error, variant: 'destructive' });
    }

    setIsSaving(false);
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Options for compression
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.8
    }

    try {
      toast({ title: 'Comprimiendo imagen...', description: 'Por favor, espera un momento.' });
      const compressedFile = await imageCompression(file, options);
      
      setImageFile(compressedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Error comprimiendo la imagen:', error);
      toast({
        title: 'Error de Compresión',
        description: 'No se pudo procesar la imagen. Intenta con otra.',
        variant: 'destructive',
      });
      // Fallback to original file if compression fails, but check size
      if (file.size > 2 * 1024 * 1024) { // 2MB limit on server
         toast({
          title: 'Archivo demasiado grande',
          description: 'La imagen no se pudo comprimir y supera los 2 MB.',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 overflow-y-auto max-h-[calc(100vh-10rem)] pr-4">
        
        <FormItem>
          <FormLabel>Imagen del Producto</FormLabel>
          <FormControl>
            <div className="flex flex-col items-center gap-4">
                <div className="w-full h-40 relative rounded-md border border-dashed flex items-center justify-center bg-muted/50">
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Vista previa del producto" fill style={{objectFit: 'contain'}} className="rounded-md" />
                    ) : (
                        <span className="text-muted-foreground text-sm">Vista previa</span>
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
                    <Upload className="mr-2 h-4 w-4" />
                    {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
                </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>

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
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className='flex justify-between items-center'>
                <FormLabel>Descripción</FormLabel>
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
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
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
