import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, ChevronRight, User, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EscrowSidebar } from '@/components/admin/EscrowSidebar';
import { useCategory } from '@/context/CategoryContext';
import { cn } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logout, activeCategoryId, getCategory } = useCategory();

  const activeCategory = activeCategoryId ? getCategory(activeCategoryId) : undefined;

  const handleLogout = () => {
    logout();
    navigate('/signup');
  };

  // Derive breadcrumbs based on route
  const isFormBuilder = location.pathname.includes('/builder');
  const categoryTitle = activeCategory ? activeCategory.title : 'Category';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Escrow Sidebar */}
      <EscrowSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 min-h-screen',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 md:px-6 backdrop-blur-md">
          {/* Left Header: Mobile menu button + Breadcrumbs */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-2 text-xs md:text-sm font-medium">
              <Link
                to="/categories"
                className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center"
              >
                Categories
              </Link>

              {isFormBuilder && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-slate-300 font-semibold">{categoryTitle}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    Form Builder
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-xs">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-200">Admin Panel</span>
            </div>

            {/* Admin User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 h-9 px-2 rounded-xl hover:bg-slate-800 text-slate-200"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-md">
                    {adminUser?.name ? adminUser.name.charAt(0) : 'A'}
                  </div>
                  <span className="hidden md:inline text-xs font-semibold">
                    {adminUser?.name || 'Admin'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {adminUser?.name || 'John Admin'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {adminUser?.email || 'admin@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-900/60">
          <Outlet />
        </main>
      </div>
    </div>
  );
}