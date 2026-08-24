'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getShortLabel } from '@/utils/suggestionLabels';
import { SuggestionObject } from '@/types/chat';

interface SuggestionChipsProps {
  suggestions: (string | SuggestionObject)[];
  onSelect: (fullQuestion: string) => void;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  const displayChips = suggestions.slice(0, 4).map((sug) => {
    if (typeof sug === 'string') {
      return {
        short_label: getShortLabel(sug),
        full_question: sug,
      };
    }
    return {
      short_label: sug.short_label || getShortLabel(sug.full_question),
      full_question: sug.full_question,
    };
  });

  return (
    <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
      <div className="text-xs font-bold text-[#1E88FF] dark:text-[#1E88FF] mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
        <span className="uni-bullet">➲</span>
        <span>You may also want to know:</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {displayChips.map((chip, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(chip.full_question)}
            className="h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 hover:bg-[#1E88FF] hover:text-white dark:hover:bg-[#1E88FF] dark:hover:text-white text-slate-800 dark:text-slate-200 font-semibold text-xs shadow-sm hover:shadow-md transition-all text-left truncate flex items-center justify-between group"
            title={chip.full_question}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="uni-bullet text-[#1E88FF] group-hover:text-white">➲</span>
              <span className="truncate">{chip.short_label}</span>
            </div>
            <span className="text-slate-400 group-hover:text-[#1E88FF] ml-1 text-xs">
              →
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
