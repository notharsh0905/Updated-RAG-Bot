'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-800">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-[#002B49] dark:text-white tracking-tight">
            Unexpected Application Error
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            An unexpected error occurred while processing your request. You can attempt to reload the component state.
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="w-full py-2.5 px-4 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Application Page</span>
        </button>
      </div>
    </div>
  );
}
