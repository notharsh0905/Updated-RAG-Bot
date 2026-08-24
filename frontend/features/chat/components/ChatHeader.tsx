'use client';

import React from 'react';
import Link from 'next/link';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  Sun,
  Moon,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

interface ChatHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  onNewChat,
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 transition-colors">
      {/* Left Section: Sidebar Toggle & Official CSJMU Status Pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeftOpen className="w-5 h-5" />
          )}
        </button>

        {/* Official CSJMU Intelligence Status Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 min-w-0 max-w-[190px] xs:max-w-[240px] sm:max-w-none">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 relative" />
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 leading-none min-w-0 truncate">
            <img
              src="/images/csjmu-seal-logo.jpg"
              alt="CSJMU Logo"
              className="w-4 h-4 rounded-full object-contain shrink-0"
            />
            <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
              CSJMU Intelligence
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[#8B0000] dark:text-amber-400 font-semibold border border-slate-300 dark:border-amber-400/20 shrink-0">
              v2.5
            </span>
          </div>

          <span className="hidden md:inline text-slate-300 dark:text-slate-600">•</span>

          {/* Horizontally Aligned Verified Status Icon */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px] font-medium leading-none shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Official Campus Portal</span>
          </span>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/70 rounded-lg transition-all active:scale-95"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#8B0000] dark:text-amber-400" />
          <span>New Chat</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
          title="Return to main university portal"
        >
          <Home className="w-3.5 h-3.5 text-[#002B49] dark:text-blue-400" />
          <span className="hidden sm:inline">Main Portal</span>
        </Link>
      </div>
    </header>
  );
};
