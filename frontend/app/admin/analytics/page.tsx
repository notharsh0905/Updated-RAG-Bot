'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { AnalyticsSummary } from '@/types/chat';
import { Activity, ArrowLeft } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    apiService.getAdminAnalytics().then(setAnalytics).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            📊 Detailed Query Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Query traffic, execution response time, cache ratios
          </p>
        </div>
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-csjmu-blue hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-sm text-csjmu-navy dark:text-csjmu-gold">
          <Activity className="w-5 h-5" />
          <span>Execution Performance Summary</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <span className="text-slate-400 block">Total Queries:</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{analytics?.total_queries || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <span className="text-slate-400 block">Avg Response Time:</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{analytics?.avg_response_time_sec || 0}s</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <span className="text-slate-400 block">Cache Hits:</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{analytics?.cache_hits || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <span className="text-slate-400 block">Satisfaction:</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{analytics?.satisfaction_pct || 100}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
