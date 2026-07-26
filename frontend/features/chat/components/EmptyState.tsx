'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  DollarSign,
  Briefcase,
  Home,
  Building,
  GraduationCap,
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
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400',
    },
    {
      icon: DollarSign,
      category: 'Scholarships & Aid',
      title: 'UP Fee Reimbursement & Waivers',
      query: 'What scholarships, UP post-matric fee reimbursement rules, and tuition fee waivers are available for UIET students?',
      color: 'from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400',
    },
    {
      icon: Briefcase,
      category: 'Placements & Statistics',
      title: 'Highest Placement Packages',
      query: 'What is the highest and average placement package, top recruiting companies, and campus placement records at UIET Kanpur?',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
      icon: Home,
      category: 'Hostels & Mess',
      title: 'Hostel Accommodation & Facilities',
      query: 'What hostel facilities, mess charges, room allotment rules, and curfew timings exist for boys and girls hostels at CSJMU?',
      color: 'from-rose-500/10 to-crimson-500/10 border-rose-500/20 text-rose-400',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 max-w-4xl mx-auto w-full">
      {/* Hero Badge & Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-3 mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-amber-400 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Official CSJMU AI Campus Intelligence</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
          How can I assist your campus journey?
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
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
              className="group text-left p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-slate-600 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-3 active:scale-99"
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r ${prompt.color}`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{prompt.category}</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  {prompt.title}
                </h3>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
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
        className="mt-8 flex items-center gap-4 text-[11px] text-slate-400 font-medium"
      >
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Grounded in official records
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-blue-400" /> Instant retrieval
        </span>
      </motion.div>
    </div>
  );
};
