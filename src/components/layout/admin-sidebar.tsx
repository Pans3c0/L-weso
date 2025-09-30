'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Home,
  ShoppingCart,
  Users,
  LineChart,
  Package2,
  Store,
  Bell,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


export function AdminSidebar() {
    const pathname = usePathname()

    const navItems = [
        { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
        { href: "/admin/requests", icon: Bell, label: "Solicitudes" },
        { href: "/admin/orders", icon: ShoppingCart, label: "Pedidos" },
        { href: "/admin/products", icon: Package, label: "Productos" },
        { href: "/admin/customers", icon: Users, label: "Clientes" },
        { href: "/admin/analytics", icon: LineChart, label: "Analíticas" },
    ];
    
    const implementedRoutes = ["/admin/products", "/admin/requests", "/admin/dashboard", "/admin/orders", "/admin/customers"];

    return (
        <div className="hidden border-r bg-background md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/admin/products" className="flex items-center gap-2 font-semibold font-headline">
                        <Package2 className="h-6 w-6" />
                        <span className="">Mercado Vecinal</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {navItems.map(item => {
                            const isActive = pathname.startsWith(item.href);
                            const isImplemented = implementedRoutes.includes(item.href);

                            return (
                                <Link
                                    key={item.label}
                                    href={isImplemented ? item.href : '#'}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                                        isActive ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary",
                                        !isImplemented && "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={(e) => !isImplemented && e.preventDefault()}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                    {item.badge && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{item.badge}</Badge>}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                <div className="mt-auto p-4">
                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                        <Store className="h-4 w-4" />
                        Ir a la tienda
                    </Link>
                </div>
            </div>
        </div>
    )
}
