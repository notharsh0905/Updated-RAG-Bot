'use client';

import React from 'react';
import { ReviewPriority } from '@/types/admin';
import { AlertOctagon, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface PriorityBadgeProps {
  priority: ReviewPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const getBadgeStyle = () => {
    switch (priority) {
      case 'Critical':
        return {
          color: 'bg-red-100 dark:bg-rose-950 text-red-700 dark:text-rose-300 border-red-300 dark:border-rose-800',
          icon: AlertOctagon,
        };
      case 'High':
        return {
          color: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          icon: AlertTriangle,
        };
      case 'Medium':
        return {
          color: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          icon: AlertCircle,
        };
      case 'Low':
        return {
          color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
          icon: Info,
        };
    }
  };

  const { color, icon: Icon } = getBadgeStyle();
  const textSize = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold ${color} ${textSize}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{priority}</span>
    </span>
  );
};
