'use client';

import React from 'react';
import { Lightbulb, FileText, Search } from 'lucide-react';

interface QuickActionBarProps {
  onSelectQuery: (query: string) => void;
  disabled?: boolean;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onSelectQuery,
  disabled,
}) => {
  const quickActions = [
    {
      icon: Lightbulb,
      label: 'Explain Simply',
      query: 'Could you please explain the above response in simple bullet points?',
      color: 'text-amber-400',
    },
    {
      icon: FileText,
      label: 'Summarize Key Points',
      query: 'Please provide a concise summary of the key takeaways from this response.',
      color: 'text-blue-400',
    },
    {
      icon: Search,
      label: 'Find Related Details',
      query: 'What other official guidelines or related details exist for this topic at CSJMU?',
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-1">
      {quickActions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuery(action.query)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] font-medium text-slate-300 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none group"
            title={action.label}
          >
            <Icon className={`w-3 h-3 ${action.color} group-hover:scale-110 transition-transform`} />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};
