'use client';

import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-background min-h-screen transition-colors duration-500">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-10 overflow-x-hidden pt-24 lg:pt-10 relative">
        {/* Animated background decoration */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full animate-pulse delay-1000" />
        
        <div className="max-w-7xl mx-auto">
          <div className="bg-transparent rounded-[2.8rem]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
