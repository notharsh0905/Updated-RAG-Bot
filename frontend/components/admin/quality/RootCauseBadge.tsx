'use client';

import React from 'react';
import { RootCauseCategory } from '@/types/admin';
import { FileX, Clock, SearchX, MessageSquareWarning, Cpu, Database, CopyX, HelpCircle } from 'lucide-react';

interface RootCauseBadgeProps {
  category: RootCauseCategory;
}

export const RootCauseBadge: React.FC<RootCauseBadgeProps> = ({ category }) => {
  const getCategoryConfig = () => {
    switch (category) {
      case 'Missing Document':
        return { color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800', icon: FileX };
      case 'Outdated Information':
        return { color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800', icon: Clock };
      case 'Incorrect Retrieval':
        return { color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800', icon: SearchX };
      case 'Prompt Issue':
        return { color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800', icon: MessageSquareWarning };
      case 'Hallucination':
        return { color: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800', icon: Cpu };
      case 'Metadata Error':
        return { color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800', icon: Database };
      case 'Duplicate Chunk':
        return { color: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800', icon: CopyX };
      default:
        return { color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700', icon: HelpCircle };
    }
  };

  const { color, icon: Icon } = getCategoryConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border font-semibold text-[11px] ${color}`}>
      <Icon className="w-3 h-3 shrink-0" />
      <span>{category}</span>
    </span>
  );
};
