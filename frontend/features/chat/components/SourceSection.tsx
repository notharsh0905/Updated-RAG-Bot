'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { DocumentSource } from '@/types/chat';
import { SourceCard } from './SourceCard';

interface SourceSectionProps {
  sources?: DocumentSource[] | null;
  messageId?: string;
}

export const SourceSection: React.FC<SourceSectionProps> = ({ sources, messageId }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2.5 w-full"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 font-sans tracking-wide">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Verified Sources & References</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-300 font-mono">
            {sources.length}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">100% Grounded</span>
        </div>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {sources.map((src, idx) => (
          <SourceCard
            key={idx}
            source={src}
            index={idx}
            messageId={messageId}
          />
        ))}
      </div>
    </motion.div>
  );
};
