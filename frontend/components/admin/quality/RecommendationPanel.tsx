'use client';

import React from 'react';
import { AIRecommendation } from '@/types/admin';
import { Sparkles, CheckCircle, FilePlus, RefreshCw, Cpu } from 'lucide-react';

interface RecommendationPanelProps {
  recommendation?: AIRecommendation;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendation,
}) => {
  const defaultRec: AIRecommendation = recommendation || {
    possibleCause:
      'Unstructured tabular data or missing document metadata caused similarity mismatch in vector retrieval.',
    recommendedAction:
      'Re-ingest document PDF into knowledge store with explicit metadata tags and reduced chunk overlap.',
    potentialMissingDoc: 'CSJMU_Official_Rules_Handbook_2026.pdf',
    suggestedKBUpdate: 'Update chunk embedding metadata tags for doc_type.',
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/10 via-slate-900/5 to-amber-900/10 border border-blue-200 dark:border-blue-900/40 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8B0000] dark:text-amber-400" />
          <h4 className="text-xs font-bold text-[#002B49] dark:text-amber-400 font-sans tracking-wide">
            AI-Assisted Governance Recommendation
          </h4>
        </div>
        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-[10px] font-bold border border-blue-300 dark:border-blue-800 flex items-center gap-1">
          <Cpu className="w-3 h-3" /> Backend Recommendation Service
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Possible Cause:
          </span>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {defaultRec.possibleCause}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> Recommended Action:
          </span>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {defaultRec.recommendedAction}
          </p>
        </div>

        {defaultRec.potentialMissingDoc && (
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <FilePlus className="w-3 h-3 text-amber-500" /> Potential Missing Doc:
            </span>
            <p className="text-[#8B0000] dark:text-amber-400 font-mono text-[11px] font-bold">
              {defaultRec.potentialMissingDoc}
            </p>
          </div>
        )}

        {defaultRec.suggestedKBUpdate && (
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-blue-500" /> Suggested KB Update:
            </span>
            <p className="text-slate-800 dark:text-slate-200 font-medium">
              {defaultRec.suggestedKBUpdate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
