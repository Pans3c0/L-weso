'use client';

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { CartProvider } from "@/hooks/use-cart";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
