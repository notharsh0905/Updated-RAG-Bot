'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, ShieldAlert } from 'lucide-react';

interface ErrorMessageProps {
  onRetry: () => void;
  errorText?: string;
  question?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  onRetry,
  errorText = 'Official records service is temporarily unreachable. Please check connectivity and try again.',
  question,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-2xl bg-rose-950/25 border border-rose-800/60 backdrop-blur-md p-4 sm:p-5 text-slate-200 shadow-md space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-900/60 text-rose-300 border border-rose-700/60 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>Query Execution Failed</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {errorText}
          </p>

          {question && (
            <p className="text-[11px] text-slate-400 font-mono italic truncate mt-1">
              Prompt: "{question}"
            </p>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-rose-800/40 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-mono">No browser alert • State preserved</span>
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/70 hover:bg-rose-800 border border-rose-700/80 text-rose-100 text-xs font-medium transition-all shadow-sm active:scale-95 group"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-300 group-hover:rotate-180 transition-transform duration-300" />
          <span>Retry Question</span>
        </button>
      </div>
    </motion.div>
  );
};
