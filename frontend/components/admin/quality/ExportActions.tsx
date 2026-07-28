'use client';

import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { NegativeFeedbackItem } from '@/types/admin';
import { apiService } from '@/services/api';

interface ExportActionsProps {
  items: NegativeFeedbackItem[];
}

export const ExportActions: React.FC<ExportActionsProps> = ({ items }) => {
  const handleExportCSV = () => {
    apiService.exportReviewsCSV(items);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportCSV}
        disabled={items.length === 0}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-40"
        title="Export filtered records to CSV"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export CSV ({items.length})</span>
      </button>

      <button
        disabled
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium text-xs border border-slate-200 dark:border-slate-700 cursor-not-allowed"
        title="Excel export will connect directly when backend endpoint is enabled"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        <span>Excel (Ready)</span>
      </button>
    </div>
  );
};
