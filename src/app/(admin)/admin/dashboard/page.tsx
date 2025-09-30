import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Bienvenido a tu Panel de Administrador</CardTitle>
                <CardDescription>
                  Esta es tu página de inicio. Desde aquí puedes obtener una vista rápida de tu tienda.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Próximamente, aquí verás resúmenes y estadísticas importantes sobre tu tienda.</p>
                <p className="mt-4 text-muted-foreground">Por ahora, puedes gestionar tus productos, solicitudes, pedidos y clientes desde el menú de la izquierda.</p>
            </CardContent>
        </Card>
    </div>
  )
}
