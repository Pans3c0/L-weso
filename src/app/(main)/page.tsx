import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to shop page as the main entry point for the shop
  redirect('/shop');
}
