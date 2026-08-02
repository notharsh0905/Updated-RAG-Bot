'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, ExternalLink, ShieldCheck } from 'lucide-react';

export const TopBar: React.FC = () => {
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);

  const handleFontSizeChange = (delta: number) => {
    const newOffset = Math.max(-2, Math.min(2, fontSizeOffset + delta));
    setFontSizeOffset(newOffset);
    document.documentElement.style.fontSize = `${16 + newOffset}px`;
  };

  return (
    <div className="w-full bg-[#8B0000] text-white text-xs font-medium py-1.5 px-3 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-red-950 shadow-sm z-50 max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-[11px] sm:text-xs min-w-0 max-w-full overflow-hidden">
        <a
          href="https://csjmu.ac.in"
          target="_blank"
          rel="noreferrer"
          className="hover:text-amber-200 transition-colors flex items-center gap-1 font-semibold truncate shrink"
        >
          <span>CSJMU Main Portal</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
        <span className="opacity-40 hidden sm:inline">|</span>
        <div className="flex items-center gap-1 text-amber-300 font-semibold truncate shrink">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">NAAC A++ Accredited State University</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 text-[11px] shrink-0 max-w-full overflow-hidden">
        <Link
          href="/admin/login"
          className="hover:text-amber-200 transition-colors flex items-center gap-1.5 text-white font-semibold"
        >
          <Lock className="w-3 h-3 text-amber-300" />
          <span>University Admin Portal</span>
        </Link>
        <span className="opacity-40">|</span>
        <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded border border-white/20">
          <span className="text-[10px] text-slate-300 mr-1 hidden md:inline">Font Size:</span>
          <button
            onClick={() => handleFontSizeChange(-1)}
            className="px-1 hover:text-amber-300 font-bold transition-colors"
            title="Decrease Font Size"
            aria-label="Decrease Font Size"
          >
            A-
          </button>
          <button
            onClick={() => {
              setFontSizeOffset(0);
              document.documentElement.style.fontSize = '16px';
            }}
            className="px-1 hover:text-amber-300 font-bold transition-colors"
            title="Reset Font Size"
            aria-label="Reset Font Size"
          >
            A
          </button>
          <button
            onClick={() => handleFontSizeChange(1)}
            className="px-1 hover:text-amber-300 font-bold transition-colors"
            title="Increase Font Size"
            aria-label="Increase Font Size"
          >
            A+
          </button>
        </div>
      </div>
    </div>
  );
};
