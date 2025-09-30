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
  </change>
  <change>
    <file>src/components/layout/header.tsx</file>
    <content><![CDATA['use client';

import Link from 'next/link';
import { Package, ShoppingCart, Bell } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';

export function Header() {
  const { totalItems } = useCart();
  const { notificationCount } = useNotifications('customer_123'); // Mock customer ID

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/shop" className="mr-6 flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block">
            Mercado Vecinal
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" asChild>
                <Link href="/admin">Admin</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notificaciones"
              asChild
            >
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="relative"
              aria-label="Carrito de compras"
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
