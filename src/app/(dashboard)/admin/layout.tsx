'use client';

import { AdminNav } from '@/components/admin/admin-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
