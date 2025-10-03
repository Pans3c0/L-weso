'use client'

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft, Wrench, User, LogOut, BellPlus, Info, Bell } from 'lucide-react';
import { AdminSidebar } from './admin-sidebar';
import { useSession } from '@/hooks/use-session';
import { Skeleton } from '../ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { Badge } from '@/components/ui/badge';
import type { PurchaseRequest } from '@/lib/types';


export function AdminHeader() {
  const { session, logout, isLoading } = useSession();
  const router = useRouter();
  const {
    isUnsupported,
    userConsent,
    requestPermission,
  } = usePushNotifications();

  const [pendingRequestsCount, setPendingRequestsCount] = React.useState(0);

  React.useEffect(() => {
    async function fetchPendingRequests() {
      if (!session?.sellerId) return;
      try {
        const res = await fetch(`/api/requests?sellerId=${session.sellerId}`);
        if (res.ok) {
          const requests: PurchaseRequest[] = await res.json();
          const pendingCount = requests.filter(r => r.status === 'pending').length;
          setPendingRequestsCount(pendingCount);
        }
      } catch (error) {
        console.error("Failed to fetch pending requests count", error);
      }
    }

    if (session?.sellerId) {
      fetchPendingRequests();
      const intervalId = setInterval(fetchPendingRequests, 30000);
      return () => clearInterval(intervalId);
    }
  }, [session?.sellerId]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const showPendingRequestsBadge = pendingRequestsCount > 0;


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Sheet>
            <SheetTrigger asChild>
            <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
            >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-full max-w-sm">
            <AdminSidebar isMobile />
            </SheetContent>
        </Sheet>
        <div className="w-full flex-1">
            {/* We can add a search bar here in the future */}
        </div>

        {isUnsupported && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-5 w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Las notificaciones push no son soportadas en este navegador.</p>
            </TooltipContent>
          </Tooltip>
        )}

        {userConsent !== 'granted' && !isUnsupported && session && (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => requestPermission(session.id)} aria-label="Activar notificaciones">
                       <BellPlus className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                   <p>Activar notificaciones</p>
                </TooltipContent>
            </Tooltip>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Solicitudes pendientes"
          asChild
        >
          <Link href={'/admin/requests'}>
            <Bell className="h-5 w-5" />
            {showPendingRequestsBadge && (
              <Badge className="absolute top-0 right-0 flex h-5 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full p-0">
                {pendingRequestsCount}
              </Badge>
            )}
          </Link>
        </Button>

         {isLoading ? (
            <Skeleton className='w-8 h-8 rounded-full' />
            ) : session ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(session.name)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>
                        <p className="text-sm font-medium leading-none">{session.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session.username}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/account"><User className='mr-2'/>Mi Cuenta</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard"><Wrench className='mr-2'/>Panel de Admin</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className='mr-2'/>Cerrar Sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ) : null}
    </header>
  )
}
