import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPurchaseRequests } from "@/lib/requests";
import type { PurchaseRequest } from "@/lib/types";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PackageCheck, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

async function getConfirmedOrders(): Promise<PurchaseRequest[]> {
  const allRequests = await getPurchaseRequests();
  // Filter for confirmed orders and sort them by confirmation date
  return allRequests
    .filter((req) => req.status === 'confirmed' && req.confirmationDate)
    .sort((a, b) => new Date(b.confirmationDate!).getTime() - new Date(a.confirmationDate!).getTime());
}

export default async function OrdersPage() {
  const orders = await getConfirmedOrders();

  const upcomingOrders = orders.filter(o => new Date(o.confirmationDate!) >= new Date());
  const pastOrders = orders.filter(o => new Date(o.confirmationDate!) < new Date());

  return (
    <div>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Pedidos Activos</h1>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Próximas Entregas/Recogidas</CardTitle>
          <CardDescription>
            Estos son los pedidos confirmados que están pendientes de ser entregados o recogidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingOrders.length > 0 ? (
            <div className="space-y-4">
              {upcomingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
                <PackageCheck className="mx-auto h-12 w-12" />
                <p className="mt-4">No tienes pedidos pendientes de entrega.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Historial de Pedidos Entregados</CardTitle>
          <CardDescription>
            Estos son los pedidos que ya han sido completados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastOrders.length > 0 ? (
            <div className="space-y-4">
              {pastOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
             <div className="text-center py-10 text-muted-foreground">
                <p>Aún no has completado ningún pedido.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrderCard({ order }: { order: PurchaseRequest }) {
    const isPast = new Date(order.confirmationDate!) < new Date();
    
    return (
        <div className="border p-4 rounded-lg bg-card">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                    <p className="font-semibold text-lg">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">Pedido #{order.id.slice(-6)}</p>
                </div>
                <div className="mt-2 sm:mt-0 text-left sm:text-right">
                    <Badge variant={isPast ? 'secondary' : 'default'} className="flex items-center w-fit">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="font-semibold">{format(new Date(order.confirmationDate!), "eeee, d 'de' MMMM", { locale: es })}</span>
                        <span className="ml-2">a las {format(new Date(order.confirmationDate!), "HH:mm", { locale: es })}h</span>
                    </Badge>
                </div>
            </div>
            {order.sellerNote && (
                 <div className="mt-3 text-sm bg-muted/50 p-3 rounded-md">
                    <p><span className="font-semibold">Tu nota:</span> "{order.sellerNote}"</p>
                 </div>
            )}
             {order.customerNote && (
                 <div className="mt-3 text-sm bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-md text-yellow-800 dark:text-yellow-300">
                    <p><span className="font-semibold">Nota de retraso del cliente:</span> "{order.customerNote}"</p>
                 </div>
            )}
            <div className="mt-4 border-t pt-3">
                <h4 className="font-semibold mb-2">Artículos:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                    {order.items.map(item => (
                        <li key={item.product.id} className="flex justify-between">
                            <span>{item.product.name}</span>
                            <span className="font-mono">{(item.quantityInGrams/1000).toFixed(3)} kg</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
