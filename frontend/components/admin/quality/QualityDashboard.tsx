'use client';

import React from 'react';
import { QualityCenterAnalytics } from '@/types/admin';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from 'lucide-react';

interface QualityDashboardProps {
  analytics: QualityCenterAnalytics | null;
  onNavigateToReviews: () => void;
  onNavigateToTasks: () => void;
}

export const QualityDashboard: React.FC<QualityDashboardProps> = ({
  analytics,
  onNavigateToReviews,
  onNavigateToTasks,
}) => {
  return (
    <div className="space-y-6">
      {/* AI Quality Score Hero Card */}
      <div className="p-6 rounded-2xl bg-[#002B49] text-white shadow-lg space-y-4 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>CSJMU Enterprise Governance Index</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
              AI Quality & Response Accuracy Rating
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Real-time university evaluation index based on student satisfaction, RAG retrieval precision, and ground-truth verification.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/30 border border-white/15 text-center shrink-0 backdrop-blur-md min-w-[160px]">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              AI Quality Score
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono mt-1">
              {analytics ? `${analytics.aiQualityScore}%` : '96.4%'}
            </div>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +1.5% this month
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid with Trend Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total AI Conversations</span>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? analytics.totalConversations.toLocaleString() : '14,820'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {analytics?.trendIndicators.conversationsTrend || '+12.4% vs last week'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Student Feedback</span>
            <ThumbsUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? analytics.totalFeedback.toLocaleString() : '1,240'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {analytics?.trendIndicators.feedbackTrend || '+4.1% vs last week'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Negative Feedback</span>
            <ThumbsDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold text-red-600 dark:text-rose-400">
            {analytics ? analytics.negativeFeedback : 0}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-emerald-500" /> {analytics?.trendIndicators.negativeTrend || '-8.2% vs last week'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Open Reviews</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {analytics ? analytics.openReviews : 0}
          </div>
          <div className="text-[11px] text-slate-500">Requires Reviewer Action</div>
        </div>
      </div>

      {/* Quick Governance Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={onNavigateToReviews}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#002B49] dark:hover:border-amber-400 transition-all shadow-xs cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#002B49] dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Needs Review Queue ({analytics?.openReviews || 0} Open)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Inspect pending negative responses, assign review teams, classify root causes, and adjust workflow statuses.
            </p>
          </div>
        </div>

        <div
          onClick={onNavigateToTasks}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#002B49] dark:hover:border-amber-400 transition-all shadow-xs cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#002B49] dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Knowledge Base Tasks ({analytics?.kbTasksProgress.total || 0} Tasks)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Track document re-indexing tasks, PDF upload requirements, and vector database updates assigned to teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
