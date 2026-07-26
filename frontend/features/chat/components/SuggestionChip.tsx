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
      className="group px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60 hover:border-amber-400/50 text-slate-200 hover:text-white text-xs font-medium transition-all duration-150 shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:pointer-events-none shrink-0"
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 text-amber-400 animate-spin shrink-0" />
      ) : (
        <Sparkles className="w-3 h-3 text-amber-400 shrink-0 group-hover:rotate-12 transition-transform" />
      )}
      <span className="truncate max-w-[220px] sm:max-w-[300px]">{label}</span>
      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
    </button>
  );
};
