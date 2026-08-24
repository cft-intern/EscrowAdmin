import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, Layers, FormInput, LogOut, ChevronLeft, ChevronRight, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import { useCategory } from '@/context/CategoryContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const EscrowSidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const { adminUser, logout, activeCategoryId } = useCategory();

  const handleLogout = () => {
    logout();
    navigate('/signup');
  };

  const formBuilderLink = activeCategoryId
    ? `/categories/${activeCategoryId}/builder`
    : '/categories';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950 text-slate-200 border-r border-slate-800/80 transition-all duration-300 shadow-2xl',
          isOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar Header / Branding */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-md">
              <Shield className="h-4.5 w-4.5" />
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-100">Admin of Escrow</span>
                <span className="text-[10px] font-medium text-indigo-400 tracking-tight">Escrow Management</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden lg:flex h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            {isOpen && (
              <h2 className="px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                CONFIGURATION
              </h2>
            )}

            <div className="space-y-1">
              <NavLink
                to="/categories"
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  )
                }
              >
                <Layers className="h-5 w-5 shrink-0" />
                {isOpen && <span>Categories</span>}
              </NavLink>

              <NavLink
                to={formBuilderLink}
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  )
                }
              >
                <FormInput className="h-5 w-5 shrink-0" />
                {isOpen && <span>Form Builder</span>}
              </NavLink>
            </div>
          </div>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          {isOpen ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 px-2 py-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-indigo-400 border border-slate-700 font-bold text-sm">
                  {adminUser?.name ? adminUser.name.charAt(0) : <User className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-100 truncate">
                    {adminUser?.name || 'John Admin'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {adminUser?.email || 'admin@example.com'}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg h-9 border border-rose-500/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 py-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-indigo-400 font-bold text-xs">
                {adminUser?.name ? adminUser.name.charAt(0) : 'A'}
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
