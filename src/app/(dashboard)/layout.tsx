'use client';

import { MobileBottomNav } from '@/components/nav/mobile-bottom-nav';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Sidebar visible only on md and larger screens */}
      <div className="hidden md:block">
      </div>
      
      <main className="w-full bg-gradient-to-b from-slate-50 via-brand-blue/10 to-indigo-100 min-h-screen">
        {/* Sidebar trigger visible only on md and larger screens */}
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>
        
        {/* Add padding-bottom for mobile nav, remove for desktop */}
        <div className="mx-auto max-w-5xl px-2 pb-20 pt-4 md:px-6 md:py-6">
          {children}
        </div>
      </main>
      
      {/* Mobile bottom nav visible only on screens smaller than md */}
      <MobileBottomNav />
    </SidebarProvider>
  );
}
