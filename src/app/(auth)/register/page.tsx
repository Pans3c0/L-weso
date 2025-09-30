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
import { Package } from 'lucide-react';
import { registerCustomerAction } from './actions';

const registerSchema = z.object({
  referralCode: z.string().min(1, 'El código de referencia es obligatorio'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      referralCode: '',
      name: '',
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      const result = await registerCustomerAction(values);
      if (result.success) {
        toast({
          title: '¡Registro exitoso!',
          description: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
        });
        // Redirect to login page after successful registration
        router.push('/login');
      } else {
        throw new Error(result.error || 'Ocurrió un error desconocido.');
      }
    } catch (error) {
      toast({
        title: 'Error de registro',
        description: error instanceof Error ? error.message : 'No se pudo completar el registro.',
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
                        <Package className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl">Crear una cuenta</CardTitle>
                    <CardDescription>Únete con un código de referencia.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="referralCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Código de Referencia</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ingresa el código de tu vendedor" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre Completo</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu nombre y apellido" {...field} />
                               
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
                                <FormLabel>Nombre de Usuario</FormLabel>
                                <FormControl>
                                    <Input placeholder="Elige un nombre de usuario" {...field} />
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
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Registrando...' : 'Registrarse'}
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
