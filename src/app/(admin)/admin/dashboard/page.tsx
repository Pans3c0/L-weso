import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Bienvenido a tu Panel de Administrador</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Esta es tu página de inicio. Próximamente, aquí verás resúmenes y estadísticas importantes sobre tu tienda.</p>
                <p className="mt-4">Por ahora, puedes gestionar tus productos, solicitudes y pedidos desde el menú de la izquierda.</p>
            </CardContent>
        </Card>
    </div>
  )
}
