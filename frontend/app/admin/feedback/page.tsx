'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { AnalyticsSummary } from '@/types/chat';
import { ThumbsUp, ThumbsDown, Star, MessageSquare } from 'lucide-react';

export default function AdminFeedbackPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    apiService.getAdminAnalytics().then(setAnalytics).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
        <h2 className="text-xl font-bold text-[#002B49] dark:text-white tracking-tight">
          User Feedback & Query Ratings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          User satisfaction scores and query response ratings collected across student consultations
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <ThumbsUp className="w-4 h-4" />
            <span>Positive Feedback (Thumbs Up)</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? analytics.thumbs_up : 0}
          </div>
          <p className="text-[11px] text-slate-500">Verified Accurate Responses</p>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
            <ThumbsDown className="w-4 h-4" />
            <span>Negative Feedback (Thumbs Down)</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? analytics.thumbs_down : 0}
          </div>
          <p className="text-[11px] text-slate-500">Responses Flagged for Review</p>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-[#002B49] dark:text-[#1E88FF] font-bold text-xs">
            <Star className="w-4 h-4" />
            <span>Satisfaction Ratio</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? `${analytics.satisfaction_pct}%` : '100%'}
          </div>
          <p className="text-[11px] text-slate-500">Overall Assistant Approval</p>
        </div>
      </div>
    </div>
  );
}
