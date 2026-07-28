'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  BookOpen,
  DollarSign,
  Briefcase,
  Home as HomeIcon,
  Building,
  GraduationCap,
  Sparkles,
  Award,
  HelpCircle,
  PhoneCall,
  Info,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen, resetChat, setPendingQuestion } = useChatStore();

  if (!sidebarOpen) return null;

  const quickCategories = [
    { label: 'B.Tech Admissions', query: 'What is the admission procedure for B.Tech CSE at UIET?', icon: BookOpen },
    { label: 'Scholarships & Aid', query: 'What scholarships and UP fee reimbursement rules apply?', icon: DollarSign },
    { label: 'Placements & Career', query: 'What is the highest placement package and top recruiters at UIET?', icon: Briefcase },
    { label: 'Hostels & Mess', query: 'What hostel facilities, mess, rules, and curfew timings exist?', icon: HomeIcon },
    { label: 'UIET Departments', query: 'What engineering departments and programs exist under UIET?', icon: Building },
    { label: 'Faculty & Mentors', query: 'Tell me about the faculty background and mentorship at UIET.', icon: GraduationCap },
    { label: 'Innovation Center', query: 'What facilities exist at the Innovation Center and PEZ printing?', icon: Sparkles },
    { label: 'GATE Achievements', query: 'What are the recent GATE achievements of UIET students?', icon: Award },
  ];

  const handleCategoryClick = (query: string) => {
    setPendingQuestion(query);
    router.push('/chat');
  };

  const handleNewChat = () => {
    resetChat();
    router.push('/chat');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col shadow-2xl border-r border-slate-800 transition-all duration-300">
      {/* Top Header with Authentic CSJMU Seal */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/images/csjmu-seal-logo.jpg"
            alt="CSJMU Logo"
            className="w-7 h-7 rounded-full object-contain bg-white p-0.5"
          />
          <span className="font-bold text-sm tracking-tight text-white">CSJMU AI Portal</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Close Sidebar"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Start New Chat CTA */}
      <div className="p-3.5">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#8B0000] hover:bg-red-900 text-white rounded-lg font-semibold text-xs transition-all shadow-sm active:scale-98 border border-red-700/40"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>New AI Consultation</span>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Quick Topics */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Topics
          </div>
          <div className="space-y-1">
            {quickCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleCategoryClick(cat.query)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors text-left"
                >
                  <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campus Links */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Campus Information
          </div>
          <div className="space-y-1">
            <Link
              href="/about"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>About CSJMU & UIET</span>
            </Link>
            <Link
              href="/help"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Help & Student FAQ</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Official Contact Directory</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-1 bg-slate-950/60">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>NAAC A++ Accredited</span>
        </div>
        <p className="text-[11px] text-slate-500">CSJMU Kanpur Official Enterprise System</p>
      </div>
    </aside>
  );
};
