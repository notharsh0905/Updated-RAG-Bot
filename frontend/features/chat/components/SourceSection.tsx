'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck, X } from 'lucide-react';
import { DocumentSource } from '@/types/chat';
import { SourceCard } from './SourceCard';

interface SourceSectionProps {
  sources?: DocumentSource[] | null;
  messageId?: string;
}

export const SourceSection: React.FC<SourceSectionProps> = ({ sources, messageId }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!sources || sources.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800/80 space-y-2.5 w-full"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-300 font-sans tracking-wide">
          <BookOpen className="w-3.5 h-3.5 text-[#1268D4] dark:text-[#1E88FF]" />
          <span>Verified Sources & References</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] text-[#002B49] dark:text-[#1E88FF] font-mono font-semibold">
            {sources.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedIndex !== null && (
            <button
              onClick={() => setSelectedIndex(null)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[10px] text-slate-700 dark:text-slate-300 transition-colors"
            >
              <X className="w-3 h-3 text-slate-500 dark:text-slate-400" /> Clear focus
            </button>
          )}

          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">100% Grounded</span>
          </div>
        </div>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {sources.map((src, idx) => {
          const isSelected = selectedIndex === idx;
          const isDimmed = selectedIndex !== null && selectedIndex !== idx;

          return (
            <SourceCard
              key={idx}
              source={src}
              index={idx}
              messageId={messageId}
              isSelected={isSelected}
              isDimmed={isDimmed}
              onSelect={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
            />
          );
        })}
      </div>
    </motion.div>
  );
};
