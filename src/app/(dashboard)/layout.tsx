'use client';


export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="w-full bg-gradient-to-b from-slate-50 via-brand-blue/10 to-indigo-100 min-h-screen">
        {/* Add padding-bottom for mobile nav, remove for desktop */}
        <div className="mx-auto max-w-5xl px-2 pb-20 pt-4 md:px-6 md:py-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav visible only on screens smaller than md */}

    </>
  );
}
