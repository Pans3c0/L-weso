'use client';

import * as React from 'react';
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { useSession } from '@/hooks/use-session';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PushNotificationsProvider } from '@/hooks/use-push-notifications';
import { AdminHeader } from '@/components/layout/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading } = useSession();

  React.useEffect(() => {
    if (!isLoading && session?.role !== 'admin') {
      redirect('/unauthorized');
    }
  }, [session, isLoading]);

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PushNotificationsProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-background md:block">
          <AdminSidebar />
        </div>
        <div className="flex flex-col">
          <AdminHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
    </PushNotificationsProvider>
  );
}
