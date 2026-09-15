import { requireAdmin } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <section className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10">
      <AdminNav />
      {children}
    </section>
  );
}
