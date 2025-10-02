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
  KeyRound,
} from "lucide-react";
import * as React from 'react';
import type { PurchaseRequest } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


export function AdminSidebar({ isMobile = false }: { isMobile?: boolean }) {
    const pathname = usePathname();
    const [pendingRequestsCount, setPendingRequestsCount] = React.useState(0);

    React.useEffect(() => {
        async function fetchPendingRequests() {
            try {
                const res = await fetch('/api/requests');
                if (res.ok) {
                    const requests: PurchaseRequest[] = await res.json();
                    const pendingCount = requests.filter(r => r.status === 'pending').length;
                    setPendingRequestsCount(pendingCount);
                }
            } catch (error) {
                console.error("Failed to fetch pending requests count", error);
            }
        }
        
        fetchPendingRequests();
        const intervalId = setInterval(fetchPendingRequests, 30000); 
        return () => clearInterval(intervalId);
    }, []);

    const navItems = [
        { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
        { href: "/admin/requests", icon: Bell, label: "Solicitudes", badge: pendingRequestsCount > 0 ? pendingRequestsCount : null },
        { href: "/admin/orders", icon: ShoppingCart, label: "Pedidos" },
        { href: "/admin/products", icon: Package, label: "Productos" },
        { href: "/admin/customers", icon: Users, label: "Clientes" },
        { href: "/admin/referrals", icon: KeyRound, label: "Códigos de Referencia" },
        { href: "/admin/analytics", icon: LineChart, label: "Analíticas" },
    ];
    
    const implementedRoutes = ["/admin/products", "/admin/requests", "/admin/dashboard", "/admin/orders", "/admin/customers", "/admin/referrals"];

    return (
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
                                {item.badge != null && item.badge > 0 && (
                                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{item.badge}</Badge>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <Link
                    href="/shop"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <Store className="h-4 w-4" />
                    Ir a la tienda
                </Link>
            </div>
        </div>
    )
}
