'use client';

import * as React from 'react';
import type { Product, Seller } from '@/lib/types';
import { ProductCard } from '@/components/products/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/hooks/use-session';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, User, Info, KeyRound } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSellersAction, getCustomerSellerRelationsAction } from './actions';
import { useToast } from '@/hooks/use-toast';

export default function ShopPage() {
  const { toast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [allSellers, setAllSellers] = React.useState<Seller[]>([]);
  const [associatedSellers, setAssociatedSellers] = React.useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = React.useState<string | undefined>(undefined);
  const [isLoadingSellers, setIsLoadingSellers] = React.useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(false);
  const { session, isLoading: isLoadingSession } = useSession();

  const fetchSellersAndRelations = React.useCallback(async () => {
    setIsLoadingSellers(true);
    try {
      const allSellersData = await getSellersAction();
      setAllSellers(allSellersData);

      if (session?.role === 'customer') {
        const relations = await getCustomerSellerRelationsAction();
        const customerRelations = relations.filter(r => r.customerId === session.id);
        const sellerIds = customerRelations.map(r => r.sellerId);
        const filteredSellers = allSellersData.filter(s => sellerIds.includes(s.id));
        setAssociatedSellers(filteredSellers);
        
        if (filteredSellers.length > 0 && !selectedSeller) {
            // Default to the first associated seller only if one isn't already selected
            setSelectedSeller(filteredSellers[0].id);
        }
      } else if (allSellersData.length > 0) {
        // For guests, default to the very first seller
        setSelectedSeller(allSellersData[0].id);
        setAssociatedSellers(allSellersData);
      }
    } catch (error) {
      console.error('Failed to fetch sellers and relations', error);
      toast({ title: 'Error', description: 'No se pudieron cargar las tiendas.', variant: 'destructive' });
    } finally {
      setIsLoadingSellers(false);
    }
  }, [session, toast, selectedSeller]);
  
  React.useEffect(() => {
    fetchSellersAndRelations();
  }, [fetchSellersAndRelations]);

  React.useEffect(() => {
    async function fetchProducts() {
        if (!selectedSeller) {
          setProducts([]);
          return
        };
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
          setProducts([]); // Clear products on error
        } finally {
          setIsLoadingProducts(false);
        }
      }
    if (selectedSeller) {
      fetchProducts();
    }
  }, [selectedSeller]);

  if (isLoadingSession || isLoadingSellers) {
    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    );
  }
  
  const showSellerSelector = session?.role === 'customer' && associatedSellers.length > 1;
  const currentSellerUsername = allSellers.find(s => s.id === selectedSeller)?.username;

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
      
      {/* Show selector only if customer is associated with more than one seller */}
      {showSellerSelector ? (
        <div className="mb-8 max-w-sm mx-auto">
          <Select onValueChange={setSelectedSeller} value={selectedSeller}>
              <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tienda..." />
              </SelectTrigger>
              <SelectContent>
                  {associatedSellers.map(seller => (
                      <SelectItem key={seller.id} value={seller.id}>
                          Tienda de {seller.username}
                      </SelectItem>
                  ))}
              </SelectContent>
          </Select>
        </div>
      ) : associatedSellers.length === 1 && currentSellerUsername && (
        <p className="text-center text-muted-foreground mb-8">Comprando en: <strong>Tienda de {currentSellerUsername}</strong></p>
      )}


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
            {selectedSeller ? 'Esta tienda aún no tiene productos.' : 'Selecciona una tienda para ver sus productos.'}
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
