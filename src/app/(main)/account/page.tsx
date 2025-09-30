'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import { redirect } from 'next/navigation';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria.'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
  confirmPassword: z.string().min(1, 'Debes confirmar la nueva contraseña.'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las nuevas contraseñas no coinciden.',
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const { toast } = useToast();
  const { session, isLoading: isSessionLoading } = useSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  React.useEffect(() => {
    if (!isSessionLoading && !session) {
      redirect('/login');
    }
  }, [session, isSessionLoading]);


  const onSubmit = (values: PasswordFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // This is a simulation. In a real app, you'd check against a hashed password.
      const simulatedOldPassword = session?.username === 'juanperez' ? 'password123' : 'password';

      if (values.currentPassword !== simulatedOldPassword) {
        toast({
          title: 'Error',
          description: 'La contraseña actual es incorrecta.',
          variant: 'destructive',
        });
        form.setError('currentPassword', { message: 'La contraseña actual es incorrecta.' });
      } else {
        // In a real app, you would make an API call here to update the password.
        console.log('Simulating password change for user:', session?.username);
        console.log('New password would be:', values.newPassword);
        
        toast({
          title: '¡Contraseña actualizada!',
          description: 'Tu contraseña ha sido cambiada con éxito (simulación).',
        });
        form.reset();
      }
      setIsSubmitting(false);
    }, 1000);
  };
  
  if (isSessionLoading || !session) {
    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-2xl">
      <h1 className="font-headline text-4xl font-bold mb-8 flex items-center">
        <User className="w-8 h-8 mr-4" />
        Mi Cuenta
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Información del Perfil</CardTitle>
          <CardDescription>Estos son los detalles de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nombre de Usuario</p>
            <p className="text-lg">{session.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
            <p className="text-lg">{session.name}</p>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <KeyRound className="w-6 h-6 mr-3" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña. Recuerda que esto es una simulación y la contraseña no se guardará.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña Actual</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                   {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
