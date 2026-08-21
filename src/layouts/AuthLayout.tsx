import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@/hooks/redux';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';

export function AuthLayout() {
  const isAuthenticated = useIsAuthenticated();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Theme switcher */}
          <div className="flex justify-end mb-8">
            <ThemeSwitcher />
          </div>
          
          {/* Logo and title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Admin Template
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Production-ready React template
            </p>
          </div>

          {/* Auth form content */}
          <Outlet />
          
          {/* Footer */}
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>© 2024 CFT Admin Template. Built with React, TypeScript, and Tailwind CSS.</p>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary/30 mb-4">
              🚀
            </div>
            <h3 className="text-2xl font-semibold text-primary/70 mb-2">
              Welcome Back
            </h3>
           
          </div>
        </div>
      </div>
    </div>
  );
}