'use client';

import React from 'react';
import {
  NegativeFeedbackItem,
  WorkflowStatus,
  ReviewPriority,
  RootCauseCategory,
  ReviewerTeam,
} from '@/types/admin';
import { PriorityBadge } from './PriorityBadge';
import { RootCauseBadge } from './RootCauseBadge';
import { ReviewerSelector } from './ReviewerSelector';
import { BookOpen, ChevronRight, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface ReviewTableProps {
  items: NegativeFeedbackItem[];
  onOpenDetail: (item: NegativeFeedbackItem) => void;
  onUpdateReviewer: (id: string, reviewer: ReviewerTeam) => void;
}

export const ReviewTable: React.FC<ReviewTableProps> = ({
  items,
  onOpenDetail,
  onUpdateReviewer,
}) => {
  const getStatusBadge = (status: WorkflowStatus) => {
    switch (status) {
      case 'New':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-rose-950 text-red-700 dark:text-rose-300 border border-red-300 dark:border-rose-800">
            <Clock className="w-3 h-3" /> New
          </span>
        );
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-[#1E88FF] border border-amber-300 dark:border-blue-950">
            <AlertCircle className="w-3 h-3" /> Assigned
          </span>
        );
      case 'Investigating':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <AlertCircle className="w-3 h-3" /> Investigating
          </span>
        );
      case 'Waiting for KB Update':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <Clock className="w-3 h-3" /> Waiting KB Update
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <XCircle className="w-3 h-3" /> Closed
          </span>
        );
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Review Records Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No records match your selected search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Data Table */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3.5">Priority</th>
              <th className="p-3.5">Original Student Question</th>
              <th className="p-3.5">Root Cause Classification</th>
              <th className="p-3.5">Assigned Team</th>
              <th className="p-3.5">Workflow Status</th>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onOpenDetail(item)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
              >
                <td className="p-3.5">
                  <PriorityBadge priority={item.priority} />
                </td>

                <td className="p-3.5 max-w-xs">
                  <div className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                    "{item.question}"
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                    ID: {item.sessionId}
                  </div>
                </td>

                <td className="p-3.5">
                  <RootCauseBadge category={item.rootCause} />
                </td>

                <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                  <ReviewerSelector
                    currentReviewer={item.assignedReviewer}
                    onSelectReviewer={(rev) => onUpdateReviewer(item.id, rev)}
                  />
                </td>

                <td className="p-3.5">{getStatusBadge(item.status)}</td>

                <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {item.timestamp}
                </td>

                <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onOpenDetail(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#002B49] text-white hover:bg-[#001D33] text-xs font-semibold transition-colors shadow-xs"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenDetail(item)}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <PriorityBadge priority={item.priority} />
              {getStatusBadge(item.status)}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                "{item.question}"
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {item.answer}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
              <RootCauseBadge category={item.rootCause} />
              <span className="font-bold text-[#002B49] dark:text-[#1E88FF] text-xs flex items-center gap-1">
                Inspect <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
