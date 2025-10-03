'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Store } from 'lucide-react';
import { registerSellerAction } from './actions';

const registerSellerSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  storeName: z.string().min(3, 'El nombre de la tienda debe tener al menos 3 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  masterCode: z.string().min(1, 'El código maestro es obligatorio'),
});

export default function RegisterSellerPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof registerSellerSchema>>({
    resolver: zodResolver(registerSellerSchema),
    defaultValues: {
      username: '',
      storeName: '',
      password: '',
      masterCode: '',
    },
  });

  async function onSubmit(values: z.infer<typeof registerSellerSchema>) {
    setIsLoading(true);
    try {
      const result = await registerSellerAction(values);
      if (result.success) {
        toast({
          title: '¡Tienda Registrada!',
          description: 'La nueva cuenta de vendedor ha sido creada. Ahora puede iniciar sesión.',
        });
        router.push('/login');
      } else {
        // Show a generic error or specific if possible
        toast({
            title: 'Error de Registro',
            description: result.error || 'No se pudo crear la cuenta de vendedor.',
            variant: 'destructive',
        });
        // Optionally set a form error if it's related to a specific field
        if (result.error?.includes('usuario')) {
            form.setError('username', { message: result.error });
        } else if (result.error?.includes('tienda')) {
            form.setError('storeName', { message: result.error });
        } else {
            form.setError('masterCode', { message: result.error });
        }
      }
    } catch (error) {
      toast({
        title: 'Error de Registro',
        description: error instanceof Error ? error.message : 'No se pudo crear la cuenta de vendedor.',
        variant: 'destructive',
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <Store className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Registrar Nueva Tienda</CardTitle>
                    <CardDescription>Crea una nueva cuenta de vendedor en la plataforma.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="storeName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de la Tienda (Apodo)</FormLabel>
                                <FormControl>
                                    <Input placeholder="El nombre público de tu tienda" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre de Usuario (Login)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu usuario privado para iniciar sesión" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Crea una contraseña segura" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="masterCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Código Maestro de Registro</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Código de acceso de administrador" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Registrando...' : 'Crear Cuenta de Vendedor'}
                    </Button>
                     <p className="text-xs text-muted-foreground text-center">
                        ¿Ya tienes una cuenta?{' '}
                        <Link href="/login" className="underline hover:text-primary">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
}
