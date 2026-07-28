'use client';

import React from 'react';
import { QualityCenterAnalytics } from '@/types/admin';
import { BarChart3, PieChart, TrendingUp, BookOpen, FileCheck, Layers } from 'lucide-react';

interface AnalyticsChartsProps {
  analytics: QualityCenterAnalytics | null;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Top Grid: Failure Categories Breakdown & Feedback Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failure Categories SVG / CSS Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#8B0000] dark:text-amber-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Root Cause Failure Categories
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Classification Count</span>
          </div>

          <div className="space-y-3 pt-2">
            {analytics.failureCategories.map((item, idx) => {
              const maxCount = Math.max(...analytics.failureCategories.map((f) => f.count), 1);
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{item.category}</span>
                    <span className="text-slate-500 font-mono">{item.count} issues</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#002B49] to-[#8B0000] dark:from-blue-500 dark:to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Trend Series */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Negative Feedback Trend
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              -8.2% Reduction
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {analytics.feedbackTrendSeries.map((pt, idx) => {
              const maxVal = Math.max(...analytics.feedbackTrendSeries.map((s) => s.count), 1);
              const heightPct = Math.round((pt.count / maxVal) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 opacity-80 group-hover:opacity-100">
                    {pt.count}
                  </span>
                  <div
                    className="w-full bg-[#002B49] dark:bg-amber-400 rounded-t-lg group-hover:bg-[#8B0000] dark:group-hover:bg-amber-300 transition-all duration-300 shadow-xs"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] font-semibold text-slate-500 truncate">{pt.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Most Retrieved Documents & KB Tasks Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Retrieved Documents */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Most Retrieved University Documents
            </h3>
          </div>

          <div className="space-y-3">
            {analytics.mostRetrievedDocs.map((doc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                  {doc.docName}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-bold shrink-0">
                  {doc.count.toLocaleString()} retrievals
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* KB Tasks Progress Statistics */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Knowledge Base Tasks Progress
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Open</span>
              <div className="text-xl font-extrabold text-amber-700 dark:text-amber-300">
                {analytics.kbTasksProgress.open}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1">
              <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase">In Progress</span>
              <div className="text-xl font-extrabold text-blue-700 dark:text-blue-300">
                {analytics.kbTasksProgress.inProgress}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Completed</span>
              <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {analytics.kbTasksProgress.completed}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Overall Governance Task Resolution:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {Math.round(
                (analytics.kbTasksProgress.completed /
                  Math.max(1, analytics.kbTasksProgress.total)) *
                  100
              )}
              % Completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
