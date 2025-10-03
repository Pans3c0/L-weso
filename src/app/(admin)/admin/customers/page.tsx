'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "@/lib/types";
import { Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/use-session';


export default function CustomersPage() {
  const { toast } = useToast();
  const { session } = useSession();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const getCustomers = React.useCallback(async () => {
    if (!session?.sellerId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customers?sellerId=${session.sellerId}`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los clientes.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, session?.sellerId]);
  
  React.useEffect(() => {
    if(session?.sellerId) {
        getCustomers();
    }
  }, [getCustomers, session?.sellerId]);


  return (
    <div>
        <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Clientes</h1>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2 mt-6">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total de Clientes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{customers.length}</div>
                <p className="text-xs text-muted-foreground">
                    clientes registrados en tu tienda.
                </p>
            </CardContent>
            </Card>
        </div>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>
                Estos son los clientes que se han registrado en tu tienda.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>ID de Cliente</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No se encontraron clientes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                    <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.id}</TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
