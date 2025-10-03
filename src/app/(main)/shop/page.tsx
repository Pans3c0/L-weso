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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllSellers } from '@/lib/sellers';
import type { Seller } from '@/lib/types';


export default function ShopPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [sellers, setSellers] = React.useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = React.useState<string | undefined>(undefined);
  const [isLoadingSellers, setIsLoadingSellers] = React.useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(false);
  const { session, isLoading: isLoadingSession } = useSession();
  
  React.useEffect(() => {
    async function fetchSellers() {
      setIsLoadingSellers(true);
      try {
        const sellerData = await getAllSellers();
        setSellers(sellerData);
        // Default to the first seller if available
        if(sellerData.length > 0) {
            setSelectedSeller(sellerData[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch sellers', error);
      } finally {
        setIsLoadingSellers(false);
      }
    }
    fetchSellers();
  }, [])

  React.useEffect(() => {
    async function fetchProducts() {
        if (!selectedSeller) return;
        setIsLoadingProducts(true);
        try {
          const res = await fetch(`/api/products?sellerId=${selectedSeller}`);
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
  }, [selectedSeller]);

  if (isLoadingSession || isLoadingSellers) {
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
            : 'Explora nuestro catálogo de productos locales. Inicia sesión para comprar.'
          }
        </p>
      </div>
      
      <div className="mb-8 max-w-sm mx-auto">
        <Select onValueChange={setSelectedSeller} defaultValue={selectedSeller}>
            <SelectTrigger>
                <SelectValue placeholder="Selecciona una tienda..." />
            </SelectTrigger>
            <SelectContent>
                {sellers.map(seller => (
                    <SelectItem key={seller.id} value={seller.id}>
                        Tienda de {seller.username}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>


      {!session && (
        <Card className="max-w-lg mx-auto text-center py-12 px-6 mb-8">
            <CardContent>
                <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Acceso Exclusivo para Clientes</h2>
                <p className="text-muted-foreground mb-6">
                    Para realizar pedidos, por favor, inicia sesión.
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
          <div className="col-span-full text-center text-muted-foreground py-10">
            Esta tienda aún no tiene productos.
          </div>
      )}
      </div>
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
