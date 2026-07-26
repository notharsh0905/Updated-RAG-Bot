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
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen, resetChat, setPendingQuestion } = useChatStore();

  if (!sidebarOpen) return null;

  const quickCategories = [
    { label: 'B.Tech Admissions', query: 'What is the admission procedure for B.Tech CSE at UIET?', icon: BookOpen },
    { label: 'Scholarships & Aid', query: 'What scholarships and UP fee reimbursement rules apply?', icon: DollarSign },
    { label: 'Placements & Companies', query: 'What is the highest placement package and top recruiters at UIET?', icon: Briefcase },
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
    <aside className="fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white flex flex-col shadow-2xl border-r border-slate-800 transition-all duration-300">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-csjmu-gold" />
          <span className="font-bold text-sm tracking-wide text-white">CSJMU AI Portal</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Start New Chat Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-csjmu-blue hover:bg-csjmu-navy text-white rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95 border border-blue-400/20"
        >
          <Plus className="w-4 h-4" />
          Start New Chat
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Quick Categories */}
        <div>
          <div className="px-3 mb-2 text-xs font-bold text-csjmu-gold uppercase tracking-wider">
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
                  <Icon className="w-4 h-4 text-csjmu-gold/90 shrink-0" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portal Pages */}
        <div>
          <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Campus Information
          </div>
          <div className="space-y-1">
            <Link
              href="/about"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>About CSJMU & UIET</span>
            </Link>
            <Link
              href="/help"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Help & Student FAQ</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Official Contact</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
        <p className="font-medium text-slate-300">CSJMU Kanpur • NAAC A++</p>
        <p className="text-[11px] text-slate-500">Official AI Campus Assistant v2.5</p>
      </div>
    </aside>
  );
};
