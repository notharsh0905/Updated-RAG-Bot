'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sun, Lock, Bot, X, Compass } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useTheme } from '@/components/theme-provider';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { toggleSidebar, isAdminAuthenticated } = useChatStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isDark = resolvedTheme === 'dark';

  const navItems = [
    { href: '/', label: 'HOME' },
    { href: '/about', label: 'ABOUT US' },
    { href: '/help', label: 'HELP & FAQ' },
    { href: '/contact', label: 'CONTACT' },
    { href: '/chat', label: 'AI ASSISTANT', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full max-w-full shadow-sm">
      {/* Top Header Banner with Official CSJMU Seal */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-2 sm:py-2.5 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          {/* Main Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 sm:p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title="Toggle Quick Topics Sidebar"
            aria-label="Toggle Quick Topics Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Official CSJMU Seal & Title */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 bg-white p-0.5">
              <img
                src="/images/csjmu-seal-logo.jpg"
                alt="CSJMU Official Seal Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div className="flex flex-col min-w-0 max-w-[170px] xs:max-w-[240px] sm:max-w-none">
              <span className="font-serif font-extrabold text-xs sm:text-base md:text-lg text-[#002B49] dark:text-white tracking-tight leading-snug group-hover:text-[#8B0000] dark:group-hover:text-amber-400 transition-colors truncate">
                Chhatrapati Shahu Ji Maharaj University, Kanpur
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                University Institute of Engineering and Technology (UIET)
              </span>
            </div>
          </Link>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Menu Hamburger Button (< md) */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
            title="Toggle Mobile Navigation Drawer"
            aria-label="Toggle Mobile Navigation Drawer"
          >
            {mobileNavOpen ? <X className="w-4 h-4" /> : <Compass className="w-4 h-4 text-[#8B0000] dark:text-amber-400" />}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 sm:p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Admin Dashboard / Login Button */}
          <Link
            href={isAdminAuthenticated ? '/admin/dashboard' : '/admin/login'}
            className={`p-2 sm:p-2.5 rounded-lg transition-colors border shrink-0 ${
              isAdminAuthenticated
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 font-semibold text-xs flex items-center gap-1.5'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
            title={isAdminAuthenticated ? 'Admin Dashboard' : 'Admin Login'}
          >
            <Lock className="w-4 h-4" />
            {isAdminAuthenticated && <span className="hidden sm:inline">Admin Active</span>}
          </Link>
        </div>
      </div>

      {/* Desktop Main University Navigation Bar */}
      <nav className="hidden md:flex w-full bg-[#002B49] text-white items-center justify-between px-3 sm:px-8 text-xs font-semibold tracking-wide overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-2.5 px-4 transition-colors whitespace-nowrap border-b-2 font-medium ${
                  isActive
                    ? 'bg-[#8B0000] border-amber-400 text-white font-bold'
                    : item.highlight
                    ? 'bg-amber-400/10 text-amber-300 border-transparent hover:bg-amber-400/20 font-bold'
                    : 'hover:bg-[#00385F] border-transparent text-slate-200 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 py-1 px-3 rounded bg-white/10 border border-white/20 text-slate-100 text-[11px] font-medium">
          <Bot className="w-3.5 h-3.5 text-amber-300" />
          <span>Official AI Assistant Active</span>
        </div>
      </nav>

      {/* Mobile Responsive Navigation Drawer (Max 80vw) */}
      {mobileNavOpen && (
        <div className="md:hidden">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40"
            aria-hidden="true"
          />

          {/* Mobile Drawer Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-72 max-w-[80vw] bg-[#002B49] text-white flex flex-col shadow-2xl border-l border-slate-700 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-300" />
                <span className="font-bold text-xs uppercase tracking-wider text-amber-300">Navigation Menu</span>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`py-3 px-4 rounded-lg transition-colors text-xs font-semibold flex items-center justify-between ${
                      isActive
                        ? 'bg-[#8B0000] text-white font-bold border-l-4 border-amber-400'
                        : item.highlight
                        ? 'bg-amber-400/20 text-amber-300 font-bold'
                        : 'hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-700 text-[11px] text-slate-300 flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Official CSJMU AI Portal</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
