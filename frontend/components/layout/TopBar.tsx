'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, PhoneCall } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <div className="w-full bg-[#8B0000] text-white text-xs font-semibold py-1.5 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-red-950 shadow-sm">
      <div className="flex items-center gap-4 text-[11px] sm:text-xs">
        <a
          href="https://csjmu.ac.in"
          target="_blank"
          rel="noreferrer"
          className="hover:underline transition-opacity hover:opacity-90"
        >
          Careers @ CSJMU
        </a>
        <span className="opacity-40">|</span>
        <Link
          href="/admin/login"
          className="hover:underline transition-opacity hover:opacity-90 flex items-center gap-1 text-amber-300 font-bold"
        >
          <Lock className="w-3 h-3" />
          Student / Official Login
        </Link>
        <span className="opacity-40">|</span>
        <span className="hidden md:inline hover:underline cursor-pointer">Screen Reader</span>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <span className="hidden sm:inline text-slate-200">Official CSJMU AI Portal</span>
        <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded border border-white/20">
          <button className="px-1 hover:text-amber-300 font-bold">A-</button>
          <button className="px-1 hover:text-amber-300 font-bold">A</button>
          <button className="px-1 hover:text-amber-300 font-bold">A+</button>
        </div>
      </div>
    </div>
  );
};
