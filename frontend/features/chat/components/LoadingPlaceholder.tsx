'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cpu } from 'lucide-react';

export const LoadingPlaceholder: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 sm:gap-4 items-start w-full py-2"
    >
      {/* Avatar with glowing ring */}
      <div className="relative">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#002B49] via-slate-900 to-[#8B0000] text-amber-300 border border-[#D4AF37]/50 flex items-center justify-center shrink-0 shadow-md ring-2 ring-amber-400/20">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        </div>
      </div>

      {/* Shimmer Thinking Card */}
      <div className="flex-1 max-w-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span>Synthesizing official CSJMU records...</span>
        </div>

        {/* Shimmer Skeletons */}
        <div className="space-y-2 pt-1">
          <div className="h-3.5 bg-slate-800/80 rounded-md w-11/12 animate-pulse" />
          <div className="h-3.5 bg-slate-800/60 rounded-md w-3/4 animate-pulse [animation-delay:150ms]" />
          <div className="h-3.5 bg-slate-800/40 rounded-md w-5/6 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </motion.div>
  );
};
