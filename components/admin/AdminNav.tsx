import Link from 'next/link';
import { signOutAction } from '@/lib/actions/admin';

export default function AdminNav() {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b-2 border-ink pb-4">
      <p className="label text-accent">Admin</p>
      <Link href="/admin" className="ul-reveal label text-copy">Products</Link>
      <Link href="/admin/orders" className="ul-reveal label text-copy">Orders</Link>
      <form action={signOutAction} className="ml-auto">
        <button type="submit" className="ul-reveal label text-quiet">Sign out</button>
      </form>
    </nav>
  );
}
