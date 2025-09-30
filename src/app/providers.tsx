'use client';

import { CartProvider } from '@/hooks/use-cart';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SessionProvider } from '@/hooks/use-session';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TooltipProvider>
          <CartProvider>
              {children}
              <Toaster />
          </CartProvider>
      </TooltipProvider>
    </SessionProvider>
  );
}
