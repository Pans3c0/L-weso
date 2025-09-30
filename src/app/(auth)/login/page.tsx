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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication
    setTimeout(() => {
      if (username === 'admin' && password === 'password') {
        toast({ title: 'Inicio de sesión exitoso', description: 'Bienvenido, admin.' });
        router.push('/admin/products');
      } else {
        toast({
          title: 'Error de inicio de sesión',
          description: 'Nombre de usuario o contraseña incorrectos.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleLogin}>
        <CardHeader className="text-center">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
                <Package className="h-8 w-8 text-primary" />
            </Link>
          <CardTitle className="font-headline text-2xl">Admin Login</CardTitle>
          <CardDescription>Accede al panel de administrador.</CardDescription>
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
            ¿No eres admin?{' '}
            <Link href="/register" className="underline hover:text-primary">
              Regístrate como cliente
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
