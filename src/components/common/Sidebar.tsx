import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  UserCog,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { useCurrentUser } from '@/hooks/redux';
import { UserRole } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Users', href: '/users', icon: Users, adminOnly: true },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Profile', href: '/profile', icon: UserCog },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const user = useCurrentUser();
  const isAdmin = user?.role === UserRole.ADMIN;

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || isAdmin
  );

  return (
    <>
      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-card border-r transition-all duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center border-b px-4">
          <div className={cn('flex items-center', isOpen ? 'w-full' : 'justify-center')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              A
            </div>
            {isOpen && (
              <span className="ml-2 text-lg font-semibold">
                Admin Template
              </span>
            )}
          </div>
          
          {/* Toggle button - desktop only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              'hidden lg:flex h-6 w-6 ml-auto',
              !isOpen && 'fixed left-2 top-3 z-40'
            )}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  !isOpen && 'justify-center'
                )}
                title={!isOpen ? item.name : undefined}
              >
                <Icon className={cn('h-5 w-5', isOpen && 'mr-3')} />
                {isOpen && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User info */}
        {isOpen && user && (
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <UserCog className="h-4 w-4" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}