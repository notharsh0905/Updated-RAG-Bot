'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  GraduationCap,
  DollarSign,
  Briefcase,
  Home,
  UserCheck,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Layers,
  FileCheck,
} from 'lucide-react';
import { DocumentSource } from '@/types/chat';

interface SourceCardProps {
  source: DocumentSource;
  index: number;
  messageId?: string;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, index, messageId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Automatic Icon Mapping based on doc_type or source name
  const getSourceIcon = (docType: string, sourceName: string) => {
    const combined = `${docType} ${sourceName}`.toLowerCase();
    if (combined.includes('admission') || combined.includes('eligibility') || combined.includes('board')) {
      return <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    if (combined.includes('scholarship') || combined.includes('fee') || combined.includes('scheme')) {
      return <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    if (combined.includes('placement') || combined.includes('recruiter') || combined.includes('company')) {
      return <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
    if (combined.includes('hostel') || combined.includes('mess') || combined.includes('facility')) {
      return <Home className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    }
    if (combined.includes('teacher') || combined.includes('faculty') || combined.includes('mentor')) {
      return <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
    }
    if (combined.includes('innovation') || combined.includes('startup') || combined.includes('pez')) {
      return <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
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

  return (
    <div
      id={cardId}
      className="rounded-xl bg-slate-950/90 border border-slate-800/90 hover:border-slate-700/80 p-3 text-slate-200 transition-all duration-200 shadow-sm flex flex-col justify-between space-y-2.5 group"
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#002B49] text-amber-400 font-mono text-[10px] font-bold shrink-0 border border-amber-400/30">
            {index + 1}
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            {getSourceIcon(source.doc_type, source.source)}
            <h4 className="text-xs font-semibold text-slate-100 truncate font-sans group-hover:text-white transition-colors">
              {formatTitle(source.source)}
            </h4>
          </div>
        </div>

        {/* Category Pill */}
        {source.doc_type && (
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-medium text-slate-400 shrink-0">
            {source.doc_type}
          </span>
        )}
      </div>

      {/* Snippet Content View */}
      <div className="text-xs text-slate-300 font-sans leading-relaxed">
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs text-slate-300 space-y-2 mt-1"
          >
            <p className="whitespace-pre-wrap leading-relaxed font-sans">{source.content_snippet}</p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-emerald-400" /> Source File: {source.source}
              </span>
              {source.page && <span>Page {source.page}</span>}
            </div>
          </motion.div>
        ) : (
          <p className="line-clamp-2 text-slate-400 text-[11px] leading-relaxed">
            "{source.content_snippet}"
          </p>
        )}
      </div>

      {/* Footer Controls & Trust Badge */}
      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-medium border-t border-slate-900">
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Record
        </span>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-amber-400/90 hover:text-amber-300 transition-colors font-medium text-[11px]"
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
