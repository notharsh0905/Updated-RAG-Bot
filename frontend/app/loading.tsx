'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 w-full" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
