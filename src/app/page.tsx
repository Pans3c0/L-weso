import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirige permanentemente a la página de inicio de sesión como punto de entrada.
  redirect('/login');
}
