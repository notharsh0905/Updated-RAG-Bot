'use client';

import React from 'react';
import { ReviewerTeam } from '@/types/admin';
import { UserCheck } from 'lucide-react';

interface ReviewerSelectorProps {
  currentReviewer: ReviewerTeam;
  onSelectReviewer: (reviewer: ReviewerTeam) => void;
  disabled?: boolean;
}

const TEAMS: ReviewerTeam[] = [
  'Unassigned',
  'Admission Cell',
  'IT Cell',
  'Knowledge Base Team',
  'Registrar Office',
];

export const ReviewerSelector: React.FC<ReviewerSelectorProps> = ({
  currentReviewer,
  onSelectReviewer,
  disabled,
}) => {
  return (
    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200">
      <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
      <select
        value={currentReviewer}
        disabled={disabled}
        onChange={(e) => onSelectReviewer(e.target.value as ReviewerTeam)}
        className="bg-transparent focus:outline-none font-semibold text-xs cursor-pointer text-slate-900 dark:text-slate-100 disabled:opacity-50"
      >
        {TEAMS.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
    </div>
  );
};
