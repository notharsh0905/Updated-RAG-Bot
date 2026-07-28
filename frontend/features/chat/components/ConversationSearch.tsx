'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface ConversationSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export const ConversationSearch: React.FC<ConversationSearchProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="relative w-full">
      <div className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 focus-within:border-slate-400 dark:focus-within:border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 transition-all shadow-inner">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search chat history..."
          className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-xs font-sans"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
