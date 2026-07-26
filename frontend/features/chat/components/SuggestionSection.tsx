'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';
import { SuggestionObject } from '@/types/chat';
import { SuggestionChip } from './SuggestionChip';
import { QuickActionBar } from './QuickActionBar';

interface SuggestionSectionProps {
  suggestions?: (string | SuggestionObject)[] | null;
  onSelectQuery: (query: string) => void;
  disabled?: boolean;
  lastAssistantContent?: string;
}

export const SuggestionSection: React.FC<SuggestionSectionProps> = ({
  suggestions,
  onSelectQuery,
  disabled,
  lastAssistantContent = '',
}) => {
  const [clickedQuestion, setClickedQuestion] = useState<string | null>(null);

  // Normalize suggestions array
  const parsedSuggestions: Array<{ label: string; fullQuestion: string }> = [];

  if (suggestions && suggestions.length > 0) {
    suggestions.forEach((item) => {
      if (typeof item === 'string') {
        parsedSuggestions.push({ label: item, fullQuestion: item });
      } else if (item && typeof item === 'object' && item.full_question) {
        parsedSuggestions.push({
          label: item.short_label || item.full_question,
          fullQuestion: item.full_question,
        });
      }
    });
  }

  // Fallback context generator if backend suggestions array is empty
  if (parsedSuggestions.length === 0 && lastAssistantContent) {
    const lower = lastAssistantContent.toLowerCase();
    if (lower.includes('admission') || lower.includes('b.tech') || lower.includes('cse')) {
      parsedSuggestions.push(
        { label: 'Eligibility for B.Tech CSE', fullQuestion: 'What is the eligibility criteria and seat matrix for B.Tech CSE at UIET?' },
        { label: 'Scholarships & Fee Reimbursement', fullQuestion: 'What UP fee reimbursement rules and scholarships apply?' },
        { label: 'Highest Placement Package', fullQuestion: 'What is the highest placement package and top recruiters at UIET?' }
      );
    } else if (lower.includes('hostel') || lower.includes('mess')) {
      parsedSuggestions.push(
        { label: 'Hostel Curfew & Timings', fullQuestion: 'What hostel curfew timings, entry rules, and mess charges exist?' },
        { label: 'Hostel Allotment Rules', fullQuestion: 'What is the hostel allotment procedure for first year students?' },
        { label: 'Central Library Facilities', fullQuestion: 'What library, wifi, and sports facilities exist on campus?' }
      );
    } else if (lower.includes('scholarship') || lower.includes('fee')) {
      parsedSuggestions.push(
        { label: 'Fee Waiver Scheme (TFW)', fullQuestion: 'How to apply for Tuition Fee Waiver (TFW) seats at UIET?' },
        { label: 'UP Post-Matric Portal', fullQuestion: 'What is the step-by-step process for UP Scholarship portal submission?' },
        { label: 'Hostel & Tuition Fee Structure', fullQuestion: 'What is the complete academic and hostel fee structure?' }
      );
    } else {
      parsedSuggestions.push(
        { label: 'Show Admission Guidelines', fullQuestion: 'What are the official B.Tech admission guidelines for 2026-27?' },
        { label: 'Placement Statistics & Records', fullQuestion: 'What are the recent placement records and salary packages?' },
        { label: 'UIET Departments & Faculty', fullQuestion: 'What engineering departments and faculty mentors exist at UIET?' }
      );
    }
  }

  if (parsedSuggestions.length === 0) return null;

  const handleChipClick = (question: string) => {
    setClickedQuestion(question);
    onSelectQuery(question);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      className="mt-4 pt-3 border-t border-slate-800/80 space-y-3 w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        <span>Suggested Next Questions</span>
      </div>

      {/* Chips List with Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1 px-0.5">
        {parsedSuggestions.map((chip, idx) => (
          <SuggestionChip
            key={idx}
            label={chip.label}
            fullQuestion={chip.fullQuestion}
            onClick={handleChipClick}
            disabled={disabled}
            isLoading={disabled && clickedQuestion === chip.fullQuestion}
          />
        ))}
      </div>

      {/* AI Quick Action Buttons Bar */}
      <QuickActionBar
        onSelectQuery={onSelectQuery}
        disabled={disabled}
      />
    </motion.div>
  );
};
