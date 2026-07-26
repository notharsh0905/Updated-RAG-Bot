'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  Sparkles,
  BookOpen,
  DollarSign,
  Briefcase,
  Home as HomeIcon,
  Building,
  GraduationCap,
  Award,
  HelpCircle,
  PhoneCall,
  Info,
  X,
  Clock,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectQuery: (query: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onSelectQuery,
}) => {
  const quickCategories = [
    { label: 'B.Tech Admissions', query: 'What is the admission procedure for B.Tech CSE at UIET?', icon: BookOpen },
    { label: 'Scholarships & Aid', query: 'What scholarships and UP fee reimbursement rules apply?', icon: DollarSign },
    { label: 'Placements & Packages', query: 'What is the highest placement package and top recruiters at UIET?', icon: Briefcase },
    { label: 'Hostel Facilities', query: 'What hostel facilities, mess, rules, and curfew timings exist?', icon: HomeIcon },
    { label: 'UIET Departments', query: 'What engineering departments and programs exist under UIET?', icon: Building },
    { label: 'Faculty & Mentorship', query: 'Tell me about the faculty background and mentorship at UIET.', icon: GraduationCap },
    { label: 'Innovation Center', query: 'What facilities exist at the Innovation Center and PEZ printing?', icon: Sparkles },
    { label: 'GATE Achievements', query: 'What are the recent GATE achievements of UIET students?', icon: Award },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 flex flex-col w-72 bg-slate-950 text-slate-200 border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#002B49] to-[#8B0000] border border-[#D4AF37]/40 flex items-center justify-center font-bold text-xs text-white shadow-sm">
              CSJMU
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-tight text-white font-serif">
                UIET AI Portal
              </h2>
              <p className="text-[10px] text-amber-400 font-semibold">Official Knowledge Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Start New Chat CTA */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-between py-2.5 px-3.5 bg-gradient-to-r from-[#002B49] to-[#A51C30] hover:from-[#003B63] hover:to-[#8B0000] text-white rounded-xl font-medium text-xs transition-all shadow-md active:scale-98 border border-white/10 group"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-300" />
              <span>New Conversation</span>
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black/30 rounded text-slate-300 border border-white/10">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 custom-scrollbar">
          {/* Conversation History Area (Ready for Future History Logic) */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-500" />
                Recent History
              </span>
            </div>

            {/* Current Active Conversation Pill */}
            <div className="space-y-1">
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-300 bg-slate-800/90 border border-slate-700/60 rounded-xl transition-all text-left shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Current Session</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Quick Topics & Campus Directory */}
          <div>
            <div className="px-2 mb-2 text-[11px] font-bold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Campus Quick Topics</span>
            </div>
            <div className="space-y-0.5">
              {quickCategories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectQuery(cat.query);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors text-left group"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 shrink-0 transition-colors" />
                    <span className="truncate">{cat.label}</span>
                    <ChevronRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <div className="px-2 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Campus Links
            </div>
            <div className="space-y-0.5">
              <Link
                href="/about"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>About UIET Kanpur</span>
              </Link>
              <Link
                href="/help"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Student FAQ & Help</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Official Contacts</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer User Info & Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-700">
              🎓
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">
                Guest Student User
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" /> NAAC A++ Campus Portal
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
