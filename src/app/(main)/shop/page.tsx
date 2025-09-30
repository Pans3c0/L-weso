'use client';

import * as React from 'react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/hooks/use-session';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, User, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ShopPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  const { session, isLoading: isLoadingSession } = useSession();

  React.useEffect(() => {
    // Solo carga los productos si hay una sesión de usuario activa y ya ha sido cargada.
    if (!isLoadingSession && session) {
      async function fetchProducts() {
        setIsLoadingProducts(true);
        try {
          const res = await fetch('/api/products');
          if (!res.ok) {
            throw new Error(`Failed to fetch products: ${res.statusText}`);
          }
          const data = await res.json();
          setProducts(data);
        } catch (error) {
          console.error('Failed to fetch products', error);
        } finally {
          setIsLoadingProducts(false);
        }
      }
      fetchProducts();
    } else if (!isLoadingSession && !session) {
        // Si no hay sesión, nos aseguramos de que no haya productos y no esté cargando.
        setProducts([]);
        setIsLoadingProducts(false);
    }
  }, [session, isLoadingSession]); // El efecto se vuelve a ejecutar si la sesión o su estado de carga cambian.

  if (isLoadingSession) {
    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
            {session ? `Bienvenido, ${session.name}`: 'Nuestros Productos'}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {session 
            ? 'Productos frescos y de calidad, directamente de productores locales a tu mesa.'
            : 'Inicia sesión para ver nuestro catálogo de productos locales.'
          }
        </p>
      </div>

      {session ? (
        <>
            <Alert className="mb-8 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
                <Info className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
                <AlertTitle className="font-semibold">¿Cómo funcionan tus pedidos?</AlertTitle>
                <AlertDescription>
                    Cuando envías una solicitud de compra, se guarda asociada a tu ID de usuario ({session.id}). Solo tú podrás ver tus pedidos y su estado en la sección "Notificaciones". La persistencia se simula guardando los datos en archivos en el servidor.
                </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {isLoadingProducts ? (
                Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
                ))
            ) : products && products.length > 0 ? (
                products.map(product => (
                <ProductCard key={product.id} product={product} />
                ))
            ) : (
                <div className="col-span-full text-center text-muted-foreground">
                No se encontraron productos en este momento.
                </div>
            )}
            </div>
        </>
      ) : (
        <Card className="max-w-lg mx-auto text-center py-12 px-6">
            <CardContent>
                <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Acceso Exclusivo para Clientes</h2>
                <p className="text-muted-foreground mb-6">
                    Para ver nuestros productos y realizar pedidos, por favor, inicia sesión.
                </p>
                <Button asChild>
                    <Link href="/login">Iniciar Sesión</Link>
                </Button>
                 <p className="text-xs text-muted-foreground mt-4">
                    ¿No tienes cuenta?{' '}
                    <Link href="/register" className="underline hover:text-primary">
                    Regístrate aquí
                    </Link>
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
