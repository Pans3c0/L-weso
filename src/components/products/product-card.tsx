'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/use-cart';
import { PlusCircle } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState('100');
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    const quantityInGrams = parseInt(quantity, 10);
    if (!isNaN(quantityInGrams) && quantityInGrams > 0) {
      addToCart(product, quantityInGrams);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 3 }).format(amount);
  };
  
  const stockInKg = product.stockInGrams / 1000;
  const placeholderImageUrl = 'https://picsum.photos/seed/placeholder/600/400';

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="aspect-[3/2] relative w-full">
          <Image
            src={product.imageUrl || placeholderImageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={product.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-1">{product.name}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm mb-3 h-10">{product.description}</CardDescription>
        <div className="flex justify-between items-center text-sm">
            <p className="text-foreground font-semibold">{formatCurrency(product.pricePerGram)} / g</p>
            <p className={`font-medium ${stockInKg < 1 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {stockInKg.toFixed(1)} kg disp.
            </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <form onSubmit={handleAddToCart} className="flex items-center w-full gap-2">
          <div className="relative flex-grow">
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="pr-10"
              min="1"
              step="1"
              aria-label="Cantidad en gramos"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">g</span>
          </div>
          <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90" aria-label="Añadir al carrito">
            <PlusCircle className="h-5 w-5 text-primary-foreground" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
