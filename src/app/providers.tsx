'use client';

import { CartProvider } from '@/hooks/use-cart';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </TooltipProvider>
  );
}
