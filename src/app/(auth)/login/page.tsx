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
import { useSession } from '@/hooks/use-session';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Comprobación de credenciales de Administrador
    if (username === 'admin' && password === 'password') {
        login({ id: 'admin', name: 'Admin', username: 'admin', role: 'admin' });
        toast({ title: 'Inicio de sesión exitoso', description: 'Bienvenido, admin.' });
        router.replace('/admin/products');
        return;
    }
      
    // 2. Comprobación de credenciales de Cliente (simulado)
    // En una app real, buscarías al usuario en una base de datos y compararías la contraseña hasheada.
    const customers = await getAllCustomers();
    const customer = customers.find(c => c.username === username);

    const isJuanPerez = customer && customer.username === 'juanperez' && password === 'password123';
    const isOtherCustomer = customer && customer.username !== 'juanperez' && password === 'password';

    if (isJuanPerez || isOtherCustomer) {
        login({ id: customer.id, name: customer.name, username: customer.username, role: 'customer' });
        toast({ title: 'Inicio de sesión exitoso', description: `Bienvenido, ${customer.name}` });
        router.replace('/shop');
        setIsLoading(false);
        return;
    }

    // 3. Si ninguna credencial coincide
    setTimeout(() => {
        toast({
            title: 'Error de inicio de sesión',
            description: 'Nombre de usuario o contraseña incorrectos.',
            variant: 'destructive',
        });
        setIsLoading(false);
    }, 500);
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
