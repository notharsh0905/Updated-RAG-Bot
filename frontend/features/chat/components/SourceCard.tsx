'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  GraduationCap,
  DollarSign,
  Briefcase,
  Home,
  UserCheck,
  Sparkles,
  ChevronDown,
  ArrowUp,
  FileCheck,
} from 'lucide-react';
import { DocumentSource } from '@/types/chat';
import { EvidenceHighlight } from './EvidenceHighlight';

interface SourceCardProps {
  source: DocumentSource;
  index: number;
  messageId?: string;
  isSelected?: boolean;
  isDimmed?: boolean;
  onSelect?: () => void;
}

export const SourceCard: React.FC<SourceCardProps> = ({
  source,
  index,
  messageId,
  isSelected,
  isDimmed,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Automatic Icon Mapping based on doc_type or source name
  const getSourceIcon = (docType: string, sourceName: string) => {
    const combined = `${docType} ${sourceName}`.toLowerCase();
    if (combined.includes('admission') || combined.includes('eligibility') || combined.includes('board')) {
      return <GraduationCap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />;
    }
    if (combined.includes('scholarship') || combined.includes('fee') || combined.includes('scheme')) {
      return <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
    if (combined.includes('placement') || combined.includes('recruiter') || combined.includes('company')) {
      return <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
    }
    if (combined.includes('hostel') || combined.includes('mess') || combined.includes('facility')) {
      return <Home className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />;
    }
    if (combined.includes('teacher') || combined.includes('faculty') || combined.includes('mentor')) {
      return <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />;
    }
    if (combined.includes('innovation') || combined.includes('startup') || combined.includes('pez')) {
      return <Sparkles className="w-3.5 h-3.5 text-[#8B0000] dark:text-amber-300 shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />;
  };

  // Clean document title for display
  const formatTitle = (rawSource: string) => {
    if (!rawSource) return 'Official University Record';
    return rawSource
      .replace(/\.(txt|json|pdf|docx)$/i, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const cardId = messageId ? `source-card-${messageId}-${index}` : `source-card-${index}`;

  const handleScrollToAnswerCitation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const citationAnchorId = messageId
      ? `citation-anchor-${messageId}-${index + 1}`
      : `citation-anchor-${index + 1}`;

    const anchorElement = document.getElementById(citationAnchorId);
    if (anchorElement) {
      anchorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      anchorElement.classList.add('ring-2', 'ring-amber-400', 'animate-pulse');
      setTimeout(() => {
        anchorElement.classList.remove('ring-2', 'ring-amber-400', 'animate-pulse');
      }, 2500);
    }
  };

  return (
    <div
      id={cardId}
      onClick={onSelect}
      className={`rounded-xl border p-3 transition-all duration-200 shadow-xs flex flex-col justify-between space-y-2.5 group cursor-pointer ${
        isSelected
          ? 'bg-slate-100 dark:bg-slate-900/95 border-[#002B49] dark:border-amber-400/80 ring-2 ring-[#002B49]/20 dark:ring-amber-400/40 scale-[1.01]'
          : isDimmed
          ? 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800/70 opacity-60 hover:opacity-100'
          : 'bg-white dark:bg-slate-950/90 border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700/80'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#002B49] text-amber-300 font-mono text-[10px] font-bold shrink-0">
            {index + 1}
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            {getSourceIcon(source.doc_type, source.source)}
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate font-sans">
              {formatTitle(source.source)}
            </h4>
          </div>
        </div>

        {/* Category Pill */}
        {source.doc_type && (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400 shrink-0">
            {source.doc_type}
          </span>
        )}
      </div>

      {/* Snippet Content View */}
      <div className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 space-y-2 mt-1"
          >
            <EvidenceHighlight text={source.content_snippet} />

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Source: {source.source}
              </span>
              {source.page && <span>Page {source.page}</span>}
            </div>
          </motion.div>
        ) : (
          <p className="line-clamp-2 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
            "{source.content_snippet}"
          </p>
        )}
      </div>

      {/* Footer Controls & Reverse Navigation */}
      <div className="flex items-center justify-between pt-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-900/90">
        <button
          type="button"
          onClick={handleScrollToAnswerCitation}
          className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-[#002B49] dark:hover:text-amber-300 transition-colors"
          title="Scroll back up to citation in answer"
        >
          <ArrowUp className="w-3 h-3 text-[#8B0000] dark:text-amber-400" />
          <span>Referenced in Answer</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="flex items-center gap-1 text-[#002B49] dark:text-amber-400 hover:underline font-semibold text-[11px]"
        >
          <span>{isExpanded ? 'Collapse excerpt' : 'View excerpt'}</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
};
