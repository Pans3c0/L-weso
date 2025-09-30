'use client';

import Link from 'next/link';
import { Package, ShoppingCart, Bell } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';

export function Header() {
  const { totalItems } = useCart();
  const { notificationCount } = useNotifications('customer_123'); // Mock customer ID

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/shop" className="mr-6 flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block">
            Mercado Vecinal
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" asChild>
                <Link href="/admin">Admin</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notificaciones"
              asChild
            >
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="relative"
              aria-label="Carrito de compras"
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
