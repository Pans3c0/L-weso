'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';

const registerSchema = z.object({
  referralCode: z.string().min(6, 'El código debe tener al menos 6 caracteres'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export default function RegisterPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      referralCode: '',
      username: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    console.log(values);
    // Mock registration
    setTimeout(() => {
        toast({
            title: '¡Registro exitoso!',
            description: 'Tu cuenta ha sido creada. Ahora puedes explorar los productos.',
        });
        setIsLoading(false);
        form.reset();
    }, 1500);
  }

  return (
    <Card className="w-full max-w-sm">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader className="text-center">
                    <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
                        <Package className="h-8 w-8 text-primary" />
                    </Link>
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
                                    <Input placeholder="Ingresa tu código" {...field} />
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
                        ¿Ya tienes cuenta de admin?{' '}
                        <Link href="/login" className="underline hover:text-primary">
                            Inicia sesión
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
}
