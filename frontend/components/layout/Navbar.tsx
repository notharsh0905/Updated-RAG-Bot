'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sun, Lock, MessageSquare, Home, Sparkles } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { toggleSidebar, theme, setTheme, isAdminAuthenticated } = useChatStore();

  const isDark = theme === 'dark';

  const navItems = [
    { href: '/', label: '🏠 HOME' },
    { href: '/about', label: 'ABOUT US' },
    { href: '/help', label: 'HELP & FAQ' },
    { href: '/contact', label: 'CONTACT' },
    { href: '/chat', label: '💬 AI ASSISTANT', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Middle White Header Banner with Seal */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Authentic CSJMU Circular Seal Emblem */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#8B0000] border-2 border-[#D4AF37] flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <div className="text-center font-serif text-[10px] leading-tight font-extrabold uppercase px-1">
                CSJMU<br />KANPUR
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-serif font-extrabold text-base sm:text-2xl text-[#002B49] dark:text-white tracking-tight leading-tight">
                University Institute of Engineering and Technology
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                School of Engineering and Technology, Kanpur
              </span>
            </div>
          </Link>
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <Link
            href={isAdminAuthenticated ? '/admin/dashboard' : '/admin/login'}
            className={`p-2 rounded-lg transition-colors ${
              isAdminAuthenticated
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300'
                : 'text-slate-500 hover:text-[#002B49] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isAdminAuthenticated ? "Admin Dashboard" : "Admin Login"}
          >
            <Lock className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Primary University Navy Navigation Bar */}
      <nav className="w-full bg-[#002B49] text-white flex items-center justify-between px-4 sm:px-8 text-xs font-bold tracking-wider overflow-x-auto">
        <div className="flex items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 px-4 transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'bg-[#A51C30] border-amber-400 text-white font-extrabold shadow-inner'
                    : item.highlight
                    ? 'bg-gradient-to-r from-[#A51C30] to-csjmu-navy hover:bg-[#A51C30] text-amber-300 border-transparent'
                    : 'hover:bg-[#003B63] border-transparent text-slate-200 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 py-1.5 px-3 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official CSJMU AI Assistant Portal</span>
        </div>
      </nav>
    </header>
  );
};
