import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Wallet,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  Shield,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Breadcrumb calculation from route path
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/escrows?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="mr-3 lg:hidden text-muted-foreground"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Left: Breadcrumbs */}
      <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-muted-foreground">
        <Link to="/admin/dashboard" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        {pathSegments.map((segment, idx) => {
          if (segment === 'admin') return null;
          const isLast = idx === pathSegments.length - 1;
          const formatted = segment.replace(/-/g, ' ');
          return (
            <React.Fragment key={segment}>
              <span>/</span>
              {isLast ? (
                <span className="capitalize font-semibold text-foreground">{formatted}</span>
              ) : (
                <span className="capitalize hover:text-foreground">{formatted}</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Middle: Global Search */}
      <div className="flex-1 max-w-xs md:max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search escrows, buyers, wallets, disputes..."
            className="pl-9 h-9 text-xs bg-muted/30 border-muted focus-visible:bg-background"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 ml-auto">
        {/* Network & Wallet Badge */}
        <div className="hidden md:flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold">Ethereum</span>
          <span className="text-muted-foreground">|</span>
          <span className="font-mono text-[10px]">0x82A...91D</span>
        </div>

        {/* Notifications Popover */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <span className="text-xs font-semibold">Admin Notifications</span>
              <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                3 New
              </span>
            </div>
            <div className="divide-y divide-border max-h-64 overflow-y-auto text-xs">
              <div className="p-3 hover:bg-muted/50 cursor-pointer">
                <p className="font-medium text-foreground">Dispute #DSP-1821 Updated</p>
                <p className="text-[11px] text-muted-foreground">New evidence submitted by seller David Smith.</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">10 min ago</p>
              </div>
              <div className="p-3 hover:bg-muted/50 cursor-pointer">
                <p className="font-medium text-foreground">High Value Escrow Funded</p>
                <p className="text-[11px] text-muted-foreground">Escrow #ESC-10292 ($12,000 USDC) funded successfully.</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">1 hour ago</p>
              </div>
              <div className="p-3 hover:bg-muted/50 cursor-pointer">
                <p className="font-medium text-foreground">Category Updated</p>
                <p className="text-[11px] text-muted-foreground">Form builder published new fields for Smart Contracts.</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">2 hours ago</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-2 h-9">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                JA
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-medium leading-none">John Admin</span>
                <span className="text-[10px] text-muted-foreground">Super Admin</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-medium leading-none">John Admin</p>
                <p className="text-[11px] leading-none text-muted-foreground">john@escrowdapp.io</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin/users')}>
              <User className="mr-2 h-4 w-4" />
              <span>Admin Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Platform Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin/login')} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
