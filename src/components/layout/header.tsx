'use client';

import Link from 'next/link';
import { Package, ShoppingCart, Bell, User, LogIn, LogOut, Wrench, BellPlus, Info } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/use-session';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { session, logout, isLoading } = useSession();
  const { notificationCount } = useNotifications();
  const {
    isSubscribed,
    isUnsupported,
    userConsent,
    requestPermission,
  } = usePushNotifications();


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
  
  const showCustomerNotifications = session?.role === 'customer' && notificationCount > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/shop" className="mr-6 flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline sm:inline-block">
            L-weso
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1">
            {isLoading ? (
              <Skeleton className='w-24 h-8' />
            ) : session ? (
              <>
                {userConsent === 'granted' && !isSubscribed && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={requestPermission} aria-label="Reactivar notificaciones">
                               <BellPlus className="h-5 w-5 text-amber-500" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Reactivar notificaciones</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {isUnsupported && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-5 w-5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Las notificaciones push no son soportadas en este navegador o contexto.</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {userConsent !== 'granted' && !isUnsupported && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={requestPermission} aria-label="Activar notificaciones">
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
                  aria-label="Notificaciones"
                  asChild
                >
                  <Link href={session.role === 'admin' ? '/admin/requests' : '/notifications'}>
                    <Bell className="h-5 w-5" />
                    {showCustomerNotifications && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                      </span>
                    )}
                  </Link>
                </Button>
                
                {session.role === 'customer' && (
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
                )}

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
                        {session.role === 'admin' && (
                           <DropdownMenuItem asChild>
                               <Link href="/admin/dashboard"><Wrench className='mr-2'/>Panel de Admin</Link>
                           </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className='mr-2'/>Cerrar Sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild>
                <Link href="/login"><LogIn className="mr-2" /> Iniciar Sesión</Link>
              </Button>
            )}

          </nav>
        </div>
      </div>
    </header>
  );
}
