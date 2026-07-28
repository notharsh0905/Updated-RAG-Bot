'use client';

import React from 'react';
import { ArrowUpRight, Sparkles, Loader2 } from 'lucide-react';

interface SuggestionChipProps {
  label: string;
  fullQuestion: string;
  onClick: (question: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({
  label,
  fullQuestion,
  onClick,
  disabled,
  isLoading,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    onClick(fullQuestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onClick(fullQuestion);
    }
  };

  return (
    <button
      type="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={`Ask follow-up: ${fullQuestion}`}
      className="group px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all duration-150 shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:pointer-events-none shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002B49] dark:focus-visible:ring-amber-400"
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 text-[#8B0000] dark:text-amber-400 animate-spin shrink-0" />
      ) : (
        <Sparkles className="w-3 h-3 text-[#8B0000] dark:text-amber-400 shrink-0 group-hover:rotate-12 transition-transform" />
      )}
      <span className="truncate max-w-[220px] sm:max-w-[300px]">{label}</span>
      <ArrowUpRight className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
    </button>
  );
};
