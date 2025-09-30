'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import { loginAction } from './actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const result = await loginAction({ username, password });

        if (result.user) {
            login(result.user); // Guardar la sesión
            toast({ title: 'Inicio de sesión exitoso', description: `Bienvenido, ${result.user.name}` });

            // Redirección del lado del cliente post-login
            if (result.user.role === 'admin') {
                router.push('/admin/dashboard');
            } else if (result.user.role === 'customer') {
                router.push('/shop');
            } else {
                router.push('/'); // Fallback a la raíz
            }
        } else {
            throw new Error(result.error || 'Nombre de usuario o contraseña incorrectos.');
        }

    } catch (error) {
         toast({
            title: 'Error de inicio de sesión',
            description: error instanceof Error ? error.message : 'Ocurrió un error desconocido.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
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
