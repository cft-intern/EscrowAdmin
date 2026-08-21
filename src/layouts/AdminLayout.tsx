import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { cn } from '@/utils';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Container */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 min-h-screen',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        {/* Top Header */}
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
