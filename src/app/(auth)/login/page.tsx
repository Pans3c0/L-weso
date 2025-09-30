'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';
import { getAllCustomers } from '@/lib/customers';
import type { Customer } from '@/lib/types';


// --- Cuentas de prueba ---
// Admin:
//   user: admin
//   pass: password
//
// ADVERTENCIA: Nunca guardes credenciales directamente en el código en una aplicación real.
// Esto es solo para fines de demostración. Usa un proveedor de autenticación como Firebase Auth.

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulación de autenticación con retardo para mostrar el estado de carga
    setTimeout(async () => {
      // 1. Comprobación de credenciales de Administrador
      if (username === 'admin' && password === 'password') {
        toast({ title: 'Inicio de sesión exitoso', description: 'Bienvenido, admin.' });
        router.replace('/admin/products');
        return;
      }
      
      // 2. Comprobación de credenciales de Cliente (simulado)
      // En una app real, buscarías al usuario en una base de datos y compararías la contraseña hasheada.
      // Por ahora, solo 'juanperez' tiene una contraseña fija para demostración.
      if (username === 'juanperez' && password === 'password123') {
        toast({ title: 'Inicio de sesión exitoso', description: `Bienvenido, ${username}` });
        router.replace('/shop');
        return;
      }
      
      // Para otros usuarios registrados, simulamos que la contraseña siempre es "password"
      // ESTO ES INSEGURO Y SOLO PARA DEMOSTRACIÓN
      const customers = await getAllCustomers();
      const customer = customers.find(c => c.username === username);

      if(customer && password === 'password') {
        toast({ title: 'Inicio de sesión exitoso', description: `Bienvenido, ${customer.name}` });
        router.replace('/shop');
        return;
      }


      // 3. Si ninguna credencial coincide
      toast({
        title: 'Error de inicio de sesión',
        description: 'Nombre de usuario o contraseña incorrectos.',
        variant: 'destructive',
      });
      setIsLoading(false);

    }, 1000);
  };

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleLogin}>
        <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
                <Package className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="font-headline text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta de Mercado Vecinal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="underline hover:text-primary">
              Regístrate aquí
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
