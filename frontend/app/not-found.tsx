'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Bot, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
        
        {/* Seal Logo */}
        <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm mx-auto bg-white p-0.5">
          <img
            src="/images/csjmu-seal-logo.jpg"
            alt="CSJMU Official Seal Logo"
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-[#8B0000]/10 text-[#8B0000] dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            ERROR 404
          </span>
          <h1 className="text-2xl font-serif font-bold text-[#002B49] dark:text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The requested university resource or page does not exist or has been moved. Use the options below to navigate back.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/chat"
            className="w-full py-2.5 px-4 rounded-lg bg-[#8B0000] hover:bg-red-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>Ask AI Assistant</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
