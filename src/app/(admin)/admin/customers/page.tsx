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
import { getCustomersByReferralCode } from "@/lib/customers";
import { Users } from 'lucide-react';


async function getCustomers() {
    // In a real app, you would get the admin's specific referral code from their session
    const adminReferralCode = 'tienda_admin';
    const customers = await getCustomersByReferralCode(adminReferralCode);
    return customers;
}

export default async function CustomersPage() {
  const customers = await getCustomers();

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
                    clientes registrados con tu código de referencia.
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
                    {customers.map((customer) => (
                    <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.id}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
