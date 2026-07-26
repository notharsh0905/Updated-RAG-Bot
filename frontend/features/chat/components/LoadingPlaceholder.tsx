'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

export const LoadingPlaceholder: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 sm:gap-4 items-start w-full py-2"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#002B49] via-slate-900 to-[#8B0000] text-amber-300 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 shadow-md">
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-300 text-xs flex items-center gap-2.5 shadow-sm">
        <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        <span className="font-medium text-slate-200">
          Retrieving official CSJMU knowledge & generating response...
        </span>
        <div className="flex items-center gap-1 ml-1">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
        </div>
      </div>
    </motion.div>
  );
};
