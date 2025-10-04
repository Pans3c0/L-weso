'use client';

import * as React from 'react';
import Image from 'next/image';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { Product } from '@/lib/types';
import { ProductForm } from '@/components/admin/product-form';
import { saveProductAction, deleteProductAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/use-session';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminProductsPage() {
  const { toast } = useToast();
  const { session } = useSession();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | undefined>(undefined);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchProducts = React.useCallback(async () => {
    if (!session?.sellerId) return;
    setIsLoading(true);
    try {
      // Fetch products only for the logged-in seller
      const res = await fetch(`/api/products?sellerId=${session.sellerId}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudieron cargar los productos.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast, session?.sellerId]);

  React.useEffect(() => {
    if (session?.sellerId) {
      fetchProducts();
    }
  }, [fetchProducts, session?.sellerId]);

  const handleProductSave = async (formData: FormData) => {
    if (!session?.sellerId) {
        toast({ title: 'Error', description: 'No se pudo identificar al vendedor.', variant: 'destructive' });
        return;
    }
    
    // Add sellerId to the form data
    formData.append('sellerId', session.sellerId);
    
    const result = await saveProductAction(formData);

    if (result.success) {
      await fetchProducts(); 
      setIsSheetOpen(false);
      setEditingProduct(undefined);
      const productName = formData.get('name') as string;
      toast({ title: 'Producto guardado', description: `El producto "${productName}" ha sido guardado.` });
    } else {
       toast({ title: 'Error al guardar', description: result.error, variant: 'destructive' });
    }
  };
  
  const handleDelete = async (productId: string) => {
    setIsDeleting(true);
    await deleteProductAction(productId);
    await fetchProducts();
    setIsDeleting(false);
    toast({ title: 'Producto eliminado', description: 'El producto ha sido eliminado correctamente.' });
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsSheetOpen(true);
  }

  const handleAddNew = () => {
    setEditingProduct(undefined);
    setIsSheetOpen(true);
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Productos</h1>
        <div className="ml-auto flex items-center gap-2">
          <SheetTrigger asChild>
            <Button size="sm" className="h-8 gap-1" onClick={handleAddNew}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-rap">
                Añadir Producto
              </span>
            </Button>
          </SheetTrigger>
        </div>
      </div>
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Catálogo de Productos</CardTitle>
          <CardDescription>
            Gestiona los productos de tu tienda. Añade, edita o elimina productos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[64px] sm:w-[100px]">
                  Imagen
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Stock (g)</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Precio/g
                </TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={5} className="text-center">No se encontraron productos.</TableCell>
                </TableRow>
              ) : (
                products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.imageUrl || 'https://placehold.co/64x64/F5F5F5/696969?text=?'}
                        width="64"
                        data-ai-hint={product.imageHint}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.stockInGrams > 0 ? 'outline' : 'destructive'}>
                        {product.stockInGrams} g
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatCurrency(product.pricePerGram)}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleEdit(product)}>Editar</DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive">
                                Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente
                              el producto.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              disabled={isDeleting}
                              onClick={() => handleDelete(product.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className='font-headline'>{editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}</SheetTitle>
        </SheetHeader>
        <ProductForm 
            product={editingProduct} 
            onSave={handleProductSave}
            onCancel={() => setIsSheetOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
