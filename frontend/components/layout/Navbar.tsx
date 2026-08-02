'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sun, Lock, Bot } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useTheme } from '@/components/theme-provider';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { toggleSidebar, isAdminAuthenticated } = useChatStore();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const navItems = [
    { href: '/', label: 'HOME' },
    { href: '/about', label: 'ABOUT US' },
    { href: '/help', label: 'HELP & FAQ' },
    { href: '/contact', label: 'CONTACT' },
    { href: '/chat', label: 'AI ASSISTANT', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full max-w-full shadow-sm overflow-hidden">
      {/* Top Header Banner with Official CSJMU Seal */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-2.5 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <button
            onClick={toggleSidebar}
            className="p-1.5 sm:p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title="Toggle Sidebar Menu"
            aria-label="Toggle Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Official CSJMU Seal & Title */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 bg-white p-0.5">
              <img
                src="/images/csjmu-seal-logo.jpg"
                alt="CSJMU Official Seal Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div className="flex flex-col min-w-0">
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

      {/* Main University Navigation Bar */}
      <nav className="w-full bg-[#002B49] text-white flex items-center justify-between px-3 sm:px-8 text-xs font-semibold tracking-wide overflow-x-auto whitespace-nowrap scrollbar-none">
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
    </header>
  );
};
