

import { AdminNav } from '@/components/admin/admin-nav';
import { requireAdminServer } from '@/lib/server-auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminServer();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-brand-blue/10 to-indigo-100">
      <div className="space-y-6 p-6 md:p-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight"></h1>
        </div>

        <AdminNav />
        {/* Page content */}
        {children}
      </div>
    </div>
  );
}
