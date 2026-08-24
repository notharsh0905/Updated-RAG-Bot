'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowDown, FileText } from 'lucide-react';
import { DocumentSource } from '@/types/chat';

interface CitationTooltipProps {
  source?: DocumentSource | null;
  index: number;
  isVisible: boolean;
}

export const CitationTooltip: React.FC<CitationTooltipProps> = ({
  source,
  index,
  isVisible,
}) => {
  if (!isVisible || !source) return null;

  const formatTitle = (rawSource?: string) => {
    if (!rawSource) return 'Official University Record';
    return rawSource
      .replace(/\.(txt|json|pdf|docx)$/i, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-64 p-3 rounded-xl bg-slate-950/95 border border-slate-700/80 shadow-2xl text-slate-100 z-50 pointer-events-none space-y-2 backdrop-blur-md"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-1.5 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex items-center justify-center w-4 h-4 rounded bg-[#002B49] text-[#1268D4] font-mono text-[9px] font-bold shrink-0 border border-[#1E88FF]/40">
              {index}
            </span>
            <span className="text-xs font-semibold text-white truncate font-sans">
              {formatTitle(source.source)}
            </span>
          </div>

          {source.doc_type && (
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-300 shrink-0 border border-slate-700">
              {source.doc_type}
            </span>
          )}
        </div>

        {/* Snippet Preview */}
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2">
          "{source.content_snippet}"
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-slate-400 border-t border-slate-900">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" /> CSJMU Verified
          </span>
          <span className="text-[#1268D4]/90 flex items-center gap-0.5">
            Click to view <ArrowDown className="w-2.5 h-2.5" />
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
