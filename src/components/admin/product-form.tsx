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
import { uploadImageAction } from '@/app/(admin)/admin/products/actions';
import { Loader2, Upload } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre es obligatorio'),
  description: z.string().min(10, 'La descripción es obligatoria'),
  pricePerGram: z.coerce.number().positive('El precio debe ser un número positivo'),
  stockInGrams: z.coerce.number().int().nonnegative('El stock debe ser un número entero no negativo'),
  imageUrl: z.string().optional(),
  imageHint: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSave: (data: Omit<Product, 'id' | 'sellerId' | 'keywords'> & {imageUrl?: string}) => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(product?.imageUrl || null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      pricePerGram: product?.pricePerGram || 0,
      stockInGrams: product?.stockInGrams || 0,
      imageUrl: product?.imageUrl || '',
      imageHint: product?.imageHint || '',
    },
  });

  React.useEffect(() => {
    form.reset({
      name: product?.name || '',
      description: product?.description || '',
      pricePerGram: product?.pricePerGram || 0,
      stockInGrams: product?.stockInGrams || 0,
      imageUrl: product?.imageUrl || '',
      imageHint: product?.imageHint || '',
    });
    setImagePreview(product?.imageUrl || null);
    setImageFile(null);
  }, [product, form]);


  const onSubmit = async (data: ProductFormValues) => {
    setIsSaving(true);
    let finalImageUrl = product?.imageUrl || '';

    if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadResult = await uploadImageAction(formData);
        if (uploadResult.success && uploadResult.imageUrl) {
            finalImageUrl = uploadResult.imageUrl;
        } else {
            console.error('Image upload failed:', uploadResult.error);
        }
    }

    await onSave({ ...data, imageUrl: finalImageUrl });
    setIsSaving(false);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
                        <Image src={imagePreview} alt="Vista previa del producto" layout="fill" objectFit="contain" className="rounded-md" />
                    ) : (
                        <span className="text-muted-foreground text-sm">Vista previa</span>
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2" />
                    Subir Imagen
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
