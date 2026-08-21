import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  UserCheck,
  AlertOctagon,
  FolderTree,
  PenTool,
  Receipt,
  Percent,
  Settings,
  UserCog,
  History,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavGroup {
  groupName?: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    items: [{ name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    groupName: 'MARKETPLACE',
    items: [
      { name: 'Escrows', href: '/admin/escrows', icon: ShieldCheck, badge: '5' },
      { name: 'Buyers', href: '/admin/buyers', icon: Users },
      { name: 'Sellers', href: '/admin/sellers', icon: UserCheck },
      { name: 'Disputes', href: '/admin/disputes', icon: AlertOctagon, badge: '2' },
    ],
  },
  {
    groupName: 'CONFIGURATION',
    items: [
      { name: 'Categories', href: '/admin/categories', icon: FolderTree },
      { name: 'Form Builder', href: '/admin/form-builder', icon: PenTool },
    ],
  },
  {
    groupName: 'FINANCE',
    items: [
      { name: 'Transactions', href: '/admin/transactions', icon: Receipt },
      { name: 'Fees', href: '/admin/fees', icon: Percent },
    ],
  },
  {
    groupName: 'SETTINGS',
    items: [{ name: 'Settings', href: '/admin/settings', icon: Settings }],
  },
  {
    groupName: 'ADMINISTRATION',
    items: [
      { name: 'Admin Users', href: '/admin/users', icon: UserCog },
      { name: 'Activity', href: '/admin/activity', icon: History },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-all duration-300 select-none shadow-xl lg:shadow-none',
          isOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header Branding */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-primary-foreground shadow-md font-bold">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1">
                  ESCROW ADMIN
                  <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" />
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  v2.4 • Web3 Fintech
                </span>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden lg:flex h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {isOpen && group.groupName && (
                <div className="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                  {group.groupName}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));

                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-all group relative',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        !isOpen && 'justify-center px-0'
                      )}
                      title={!isOpen ? item.name : undefined}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', isOpen && 'mr-3')} />
                      {isOpen && (
                        <>
                          <span className="flex-1 truncate">{item.name}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-primary/10 text-primary'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Admin Profile */}
        <div className="border-t p-3 bg-muted/20">
          <div className={cn('flex items-center', isOpen ? 'justify-between' : 'justify-center')}>
            {isOpen ? (
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-500 font-bold text-xs">
                  JA
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate text-foreground">John Admin</span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Super Administrator
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-500 font-bold text-xs">
                JA
              </div>
            )}

            {isOpen && (
              <NavLink to="/admin/login">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                </Button>
              </NavLink>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
