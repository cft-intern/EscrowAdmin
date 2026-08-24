import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  UserCog,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Bell,
  CreditCard,
  Shield,
  Database,
  Activity,
  Calendar,
  Mail,
  Globe,
  Zap,
  HelpCircle,
  Search,
  Upload,
  Download,
  Archive,
  Monitor,
  Smartphone,
  Key
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
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { 
    name: 'Analytics', 
    icon: BarChart3,
    children: [
      { name: 'Overview', href: '/analytics', icon: Activity },
      { name: 'Reports', href: '/analytics/reports', icon: FileText },
      { name: 'Real-time', href: '/analytics/realtime', icon: Monitor },
      { name: 'Performance', href: '/analytics/performance', icon: Zap },
    ]
  },
  { 
    name: 'User Management', 
    icon: Users,
    adminOnly: true,
    children: [
      { name: 'All Users', href: '/users', icon: Users },
      { name: 'User Roles', href: '/users/roles', icon: Shield },
      { name: 'Permissions', href: '/users/permissions', icon: Key },
      { name: 'User Groups', href: '/users/groups', icon: Archive },
    ]
  },
  { 
    name: 'Content', 
    icon: FileText,
    children: [
      { name: 'Posts', href: '/content/posts', icon: FileText },
      { name: 'Media Library', href: '/content/media', icon: Upload },
      { name: 'Categories', href: '/content/categories', icon: Archive },
      { name: 'Tags', href: '/content/tags', icon: Archive },
    ]
  },
  { 
    name: 'E-commerce', 
    icon: CreditCard,
    children: [
      { name: 'Products', href: '/ecommerce/products', icon: Archive },
      { name: 'Orders', href: '/ecommerce/orders', icon: CreditCard, badge: '12' },
      { name: 'Customers', href: '/ecommerce/customers', icon: Users },
      { name: 'Inventory', href: '/ecommerce/inventory', icon: Database },
    ]
  },
  { 
    name: 'Communication', 
    icon: Mail,
    children: [
      { name: 'Messages', href: '/communication/messages', icon: Mail, badge: '5' },
      { name: 'Notifications', href: '/communication/notifications', icon: Bell },
      { name: 'Email Templates', href: '/communication/templates', icon: FileText },
      { name: 'Broadcasts', href: '/communication/broadcasts', icon: Globe },
    ]
  },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { 
    name: 'Tools', 
    icon: Settings,
    children: [
      { name: 'Search', href: '/tools/search', icon: Search },
      { name: 'Import/Export', href: '/tools/import-export', icon: Download },
      { name: 'Backup', href: '/tools/backup', icon: Database },
      { name: 'Logs', href: '/tools/logs', icon: FileText },
    ]
  },
  { name: 'Profile', href: '/profile', icon: UserCog },
  { 
    name: 'Settings', 
    icon: Settings,
    children: [
      { name: 'General', href: '/settings', icon: Settings },
      { name: 'Security', href: '/settings/security', icon: Shield },
      { name: 'Notifications', href: '/settings/notifications', icon: Bell },
      { name: 'Integrations', href: '/settings/integrations', icon: Zap },
      { name: 'API Keys', href: '/settings/api', icon: Key },
      { name: 'Billing', href: '/settings/billing', icon: CreditCard },
    ]
  },
  { name: 'Help & Support', href: '/support', icon: HelpCircle },
];

interface NavItemComponentProps {
  item: NavItem;
  isOpen: boolean;
  level?: number;
}

function NavItemComponent({ item, isOpen, level = 0 }: NavItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const user = useCurrentUser();
  const isAdmin = user?.role === UserRole.ADMIN;

  // Don't render admin-only items for non-admin users
  if (item.adminOnly && !isAdmin) {
    return null;
  }

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? location.pathname === item.href : false;
  const hasActiveChild = item.children?.some(child => 
    child.href && location.pathname.startsWith(child.href)
  );

  // Auto-expand if has active child
  React.useEffect(() => {
    if (hasActiveChild && isOpen) {
      setIsExpanded(true);
    }
  }, [hasActiveChild, isOpen]);

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const Icon = item.icon;
  const indent = level * 16;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={handleClick}
          className={cn(
            'flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            (isActive || hasActiveChild)
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            !isOpen && 'justify-center'
          )}
          style={{ paddingLeft: isOpen ? `${12 + indent}px` : undefined }}
          title={!isOpen ? item.name : undefined}
        >
          <Icon className={cn('h-5 w-5', isOpen && 'mr-3')} />
          {isOpen && (
            <>
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <span className="ml-2 inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium">
                  {item.badge}
                </span>
              )}
              {isExpanded ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </>
          )}
        </button>

        {/* Submenu */}
        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavItemComponent
                key={child.name}
                item={child}
                isOpen={isOpen}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular nav item
  return (
    <NavLink
      to={item.href!}
      className={({ isActive }) =>
        cn(
          'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          !isOpen && 'justify-center'
        )
      }
      style={{ paddingLeft: isOpen ? `${12 + indent}px` : undefined }}
      title={!isOpen ? item.name : undefined}
    >
      <Icon className={cn('h-5 w-5', isOpen && 'mr-3')} />
      {isOpen && (
        <>
          <span>{item.name}</span>
          {item.badge && (
            <span className="ml-auto inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function EnhancedSidebar({ isOpen, onToggle }: SidebarProps) {
  const user = useCurrentUser();

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
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-card border-r transition-all duration-300 overflow-hidden',
          isOpen ? 'w-80 translate-x-0' : 'w-16 -translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center border-b px-4">
          <div className={cn('flex items-center', isOpen ? 'w-full' : 'justify-center')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              A
            </div>
            {isOpen && (
              <div className="ml-3 flex-1">
                <span className="text-lg font-semibold">Admin of Escrow</span>
                <div className="text-xs text-muted-foreground">Enterprise Edition</div>
              </div>
            )}
          </div>
          
          {/* Toggle button - desktop only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              'hidden lg:flex h-6 w-6',
              isOpen ? 'ml-auto' : 'fixed left-2 top-3 z-40'
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
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavItemComponent
              key={item.name}
              item={item}
              isOpen={isOpen}
            />
          ))}
        </nav>

        {/* User info */}
        {isOpen && user && (
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.role.toLowerCase()} • {user.email}
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-3 flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <UserCog className="h-3 w-3 mr-1" />
                Profile
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        )}

        {/* Collapsed user indicator */}
        {!isOpen && user && (
          <div className="border-t p-2">
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}