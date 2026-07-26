'use client';

import React from 'react';
import Link from 'next/link';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Sparkles,
  Home,
  Sun,
  Moon,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

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
  const { theme, setTheme } = useChatStore();
  const isDark = theme === 'dark';

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 z-20">
      {/* Left Section: Sidebar Toggle & Model Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-slate-700"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeftOpen className="w-5 h-5" />
          )}
        </button>

        {/* Model Selector Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200">
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 relative" />
          </div>
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            <span>CSJMU Intelligence</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-amber-400 border border-amber-400/20">
              v2.5
            </span>
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400 text-[11px] font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Official Campus Portal
          </span>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/70 rounded-lg transition-all active:scale-95"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>New Chat</span>
        </button>

        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-300" />
          )}
        </button>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          title="Return to main university portal"
        >
          <Home className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Main Portal</span>
        </Link>
      </div>
    </header>
  );
};
