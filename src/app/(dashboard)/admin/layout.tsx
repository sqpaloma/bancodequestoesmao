'use client';

import { AdminNav } from '@/components/admin/admin-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 p-2 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Área do Admin</h1>
      </div>

      {/* Admin Navigation */}
      <AdminNav />

      {/* Page content */}
      {children}
    </div>
  );
}
