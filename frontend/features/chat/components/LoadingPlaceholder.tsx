'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

export const LoadingPlaceholder: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 sm:gap-4 items-start w-full py-2"
    >
      {/* CSJMU Official Avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 bg-white p-0.5 shrink-0 shadow-sm">
        <img
          src="/images/csjmu-seal-logo.jpg"
          alt="CSJMU Official Assistant"
          className="w-full h-full object-contain rounded-full animate-pulse"
        />
      </div>

      {/* Shimmer Thinking Card */}
      <div className="flex-1 max-w-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 backdrop-blur-md rounded-2xl p-4.5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-[#1268D4] dark:text-[#1E88FF] font-semibold">
          <Cpu className="w-3.5 h-3.5 animate-pulse text-[#1268D4] dark:text-[#1E88FF]" />
          <span>Synthesizing official CSJMU records...</span>
        </div>

        {/* Shimmer Skeletons */}
        <div className="space-y-2 pt-1">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800/80 rounded-md w-11/12 animate-pulse" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800/60 rounded-md w-3/4 animate-pulse [animation-delay:150ms]" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800/40 rounded-md w-5/6 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </motion.div>
  );
};
