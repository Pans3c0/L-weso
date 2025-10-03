'use client';

import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { submitPurchaseRequestAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useSession } from '@/hooks/use-session';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const { session, isLoading: isSessionLoading } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const canFulfillOrder = cartItems.every(item => item.quantityInGrams <= item.product.stockInGrams);
  const placeholderImageUrl = '/images/placeholder.svg';

  const handleSubmitRequest = async () => {
    if (!session) {
      toast({
        title: 'Error de autenticación',
        description: 'Debes iniciar sesión para enviar una solicitud.',
        variant: 'destructive',
      });
      return;
    }
    
    if(cartItems.length > 0) {
      const sellerId = cartItems[0].product.sellerId;
      const allSameSeller = cartItems.every(item => item.product.sellerId === sellerId);
      if (!allSameSeller) {
        toast({
          title: 'Carrito inválido',
          description: 'Todos los productos en el carrito deben ser del mismo vendedor.',
          variant: 'destructive',
        });
        return;
      }
    }


    setIsSubmitting(true);
    try {
      const result = await submitPurchaseRequestAction({ customerId: session.id, items: cartItems });
      if (result.success) {
        toast({
          title: 'Solicitud Enviada',
          description: 'El vendedor ha recibido tu solicitud y la revisará pronto.',
        });
        clearCart();
      } else {
        throw new Error(result.error || 'Algo salió mal');
      }
    } catch (error) {
      toast({
        title: 'Error al enviar la solicitud',
        description: error instanceof Error ? error.message : 'Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionLoading) {
    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="font-headline text-4xl font-bold mb-8">Tu Carrito</h1>
      {cartItems.length === 0 ? (
        <Card className="text-center py-20">
            <CardContent>
                <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Tu carrito está vacío</h2>
                <p className="text-muted-foreground mb-6">Parece que aún no has añadido ningún producto.</p>
                <Button asChild>
                    <Link href="/shop">Empezar a comprar</Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] hidden md:table-cell">Imagen</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cantidad (g)</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map(item => (
                      <TableRow key={item.product.id}>
                        <TableCell className="hidden md:table-cell">
                          <Image src={item.product.imageUrl || placeholderImageUrl} alt={item.product.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={item.product.imageHint} />
                        </TableCell>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantityInGrams}
                            onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                            className="w-24 mx-auto text-center"
                            min="0"
                            step="10"
                          />
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.quantityInGrams * item.product.pricePerGram)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className="mt-4 text-right">
                <Button variant="outline" onClick={clearCart}>Vaciar Carrito</Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Resumen de la Solicitud</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>A coordinar</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Estimado</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                {!canFulfillOrder && (
                    <Alert variant="destructive">
                        <AlertTitle>Stock Insuficiente</AlertTitle>
                        <AlertDescription>
                        Algunos productos de tu carrito superan el stock disponible. Por favor, ajusta las cantidades.
                        </AlertDescription>
                    </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90" 
                  size="lg" 
                  disabled={!canFulfillOrder || isSubmitting || !session}
                  onClick={handleSubmitRequest}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitud de Compra'}
                </Button>
              </CardFooter>
            </Card>
            {!session && (
                 <Alert variant="default" className="mt-4">
                    <AlertTitle>¡Inicia sesión!</AlertTitle>
                    <AlertDescription>
                        <Link href="/login" className='underline'>Inicia sesión</Link> o <Link href="/register" className='underline'>regístrate</Link> para poder enviar tu solicitud de compra.
                    </AlertDescription>
                </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
