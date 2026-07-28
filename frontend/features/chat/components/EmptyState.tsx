'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  DollarSign,
  Briefcase,
  Home,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const suggestedPrompts = [
    {
      icon: BookOpen,
      category: 'Admissions 2026-27',
      title: 'B.Tech CSE Admission Procedure',
      query: 'What is the complete admission procedure, eligibility, and seat matrix for B.Tech CSE at UIET Kanpur?',
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    },
    {
      icon: DollarSign,
      category: 'Scholarships & Aid',
      title: 'UP Fee Reimbursement & Waivers',
      query: 'What scholarships, UP post-matric fee reimbursement rules, and tuition fee waivers are available for UIET students?',
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    {
      icon: Briefcase,
      category: 'Placements & Statistics',
      title: 'Highest Placement Packages',
      query: 'What is the highest and average placement package, top recruiting companies, and campus placement records at UIET Kanpur?',
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      icon: Home,
      category: 'Hostels & Mess',
      title: 'Hostel Accommodation & Facilities',
      query: 'What hostel facilities, mess charges, room allotment rules, and curfew timings exist for boys and girls hostels at CSJMU?',
      color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 max-w-4xl mx-auto w-full">
      {/* Hero Logo & Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-3 mb-8"
      >
        <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md mx-auto bg-white p-0.5">
          <img
            src="/images/csjmu-seal-logo.jpg"
            alt="CSJMU Seal Logo"
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Official CSJMU AI Campus Assistant</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#002B49] dark:text-white tracking-tight font-serif">
          How can I assist your campus journey?
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Ask any official question regarding B.Tech admissions, UP fee reimbursement, hostel allotment, placements, or university facilities.
        </p>
      </motion.div>

      {/* Suggested Prompt Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full"
      >
        {suggestedPrompts.map((prompt, idx) => {
          const Icon = prompt.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(prompt.query)}
              className="group text-left p-4 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 hover:border-[#002B49] dark:hover:border-slate-700 transition-all duration-200 shadow-sm flex flex-col justify-between space-y-3 active:scale-99"
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${prompt.color}`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{prompt.category}</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#002B49] dark:group-hover:text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-[#002B49] dark:group-hover:text-white transition-colors">
                  {prompt.title}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  "{prompt.query}"
                </p>
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* Bottom Trust Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium"
      >
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Grounded in official records
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Instant RAG retrieval
        </span>
      </motion.div>
    </div>
  );
};
