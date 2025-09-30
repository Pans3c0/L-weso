'use client';

import { usePathname } from 'next/navigation';
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { CartProvider } from "@/hooks/use-cart";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            {children}
        </div>
    );
  }

  return (
    <CartProvider>
      <NotificationsProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </NotificationsProvider>
    </CartProvider>
  );
}
