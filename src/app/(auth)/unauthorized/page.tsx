import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="mx-auto bg-destructive/10 rounded-full p-3 w-fit">
            <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <CardTitle className="text-2xl font-headline mt-4">Acceso Denegado</CardTitle>
        <CardDescription>
          No tienes los permisos necesarios para acceder a esta página.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Esta sección es exclusiva para administradores.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop">Volver a la tienda</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
