import { redirect } from 'next/navigation';

// La página principal del layout (main) ahora es /shop.
// Este redirector es un seguro por si alguien aterriza en la ruta raíz del grupo.
export default function MainPage() {
  redirect('/shop');
}
