'use client';

import { AdminNav } from '@/components/admin/admin-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight"></h1>
      </div>

      <AdminNav />
      {/* Page content */}
      {children}
    </div>
  );
}
