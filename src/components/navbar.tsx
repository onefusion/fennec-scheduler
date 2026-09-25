'use client';

import React from 'react';
import Link from 'next/link';
import { FennecBrandLogo } from './fennec-brand';
import { Calendar, Settings, LogIn, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  isAdmin?: boolean;
}

export function Navbar({ isAdmin = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-stone-950/70 border-b border-stone-200/80 dark:border-stone-800/80">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity">
          <FennecBrandLogo className="w-7 h-7" />
          <span className="font-bold text-base bg-gradient-to-r from-amber-700 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
            Fennec Scheduler
          </span>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-2 text-xs font-medium">
          {isAdmin ? (
            <>
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/availability"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule</span>
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </Link>
            </>
          ) : (
            <Link
              href="/admin/login"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Host Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
