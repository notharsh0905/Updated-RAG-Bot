'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { AnalyticsSummary } from '@/types/chat';
import { ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react';

export default function AdminFeedbackPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    apiService.getAdminAnalytics().then(setAnalytics).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            📝 User Feedback Summary
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ratings & user satisfaction metrics collected from assistant responses
          </p>
        </div>
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-csjmu-blue hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
            <ThumbsUp className="w-4 h-4" />
            <span>Thumbs Up (👍)</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? analytics.thumbs_up : 0}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
            <ThumbsDown className="w-4 h-4" />
            <span>Thumbs Down (👎)</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? analytics.thumbs_down : 0}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="text-slate-500 font-bold text-xs">Satisfaction Ratio</div>
          <div className="text-3xl font-extrabold text-csjmu-navy dark:text-csjmu-gold">
            {analytics ? `${analytics.satisfaction_pct}%` : '100%'}
          </div>
        </div>
      </div>
    </div>
  );
}
