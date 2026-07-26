'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  DollarSign,
  Briefcase,
  Home as HomeIcon,
  Building,
  Award,
  ArrowRight,
  Cpu,
  Printer,
  ShieldCheck,
  Send,
  UserCheck,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

export default function HomePage() {
  const router = useRouter();
  const { setPendingQuestion } = useChatStore();
  const [quickInput, setQuickInput] = useState('');

  const handleCardClick = (query: string) => {
    setPendingQuestion(query);
    router.push('/chat');
  };

  const handleDirectSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    setPendingQuestion(quickInput.trim());
    router.push('/chat');
  };

  const usefulLinks = [
    { label: 'B. Tech Admissions Open 2026-27', query: 'What is the admission procedure for B.Tech CSE at UIET?' },
    { label: 'M. Tech Admissions Open', query: 'What is the eligibility for M.Tech admissions?' },
    { label: 'Diploma & Lateral Entry Admissions', query: 'What is the lateral entry admission procedure for B.Tech?' },
    { label: 'Events & Campus Calendar', query: 'What academic calendar and events are scheduled for UIET?' },
    { label: 'GATE Qualified Students 2024', query: 'Who achieved top GATE ranks at UIET in 2024?' },
    { label: 'Placements & Companies 2023-24', query: 'What is the highest placement package and top recruiters at UIET?' },
    { label: 'AICTE Downloads & Syllabus', query: 'Where can I find the complete course syllabus and curriculum?' },
    { label: 'Academic Calendar 2025-26', query: 'What is the evaluation schedule for mid-semester and end-semester exams?' },
  ];

  const latestNotices = [
    { title: 'Single F List of B.Tech Students 2026', tag: 'Results' },
    { title: 'B. Tech Final Year Results 2026 Declared', tag: 'Results' },
    { title: 'Regular and Backloggers Registration Schedule 2025-26', tag: 'Notice' },
    { title: '1st On Spot Counselling Session 2026-27 Results Declared', tag: 'Spot Round' },
    { title: 'Academic Calendar 2025-26 (Odd Semester)', tag: 'Academic' },
  ];

  const categories = [
    { title: '📝 B.Tech Admissions', desc: 'Eligibility, JEE Mains cutoffs & spot counselling', query: 'What is the admission procedure for B.Tech CSE at UIET?' },
    { title: '💰 Fees & Aid', desc: 'Fee structures & UP Post-Matric reimbursement', query: 'What scholarships and fee reimbursement rules apply for engineering students?' },
    { title: '💼 Placements & Career', desc: 'Highest 16 LPA packages & top recruiters', query: 'What is the highest placement package and top recruiters at UIET Kanpur?' },
    { title: '🏠 Hostels & Mess', desc: 'Hostel fee, mess charges, curfew rules & security', query: 'What hostel facilities, mess, rules, and curfew timings exist at CSJMU?' },
    { title: '🏫 UIET Departments', desc: 'CSE, ECE, Chemical, Mechanical, MSME, BCA & MCA', query: 'What engineering departments and programs exist under UIET?' },
    { title: '👨‍🏫 Faculty & Mentors', desc: 'IIT/NIT Ph.D. professors & industry experts', query: 'Tell me about the faculty background and mentorship at UIET.' },
    { title: '🚀 Innovation & PEZ', desc: 'Prototype incubation & instant PEZ QR printing', query: 'Tell me about the CSJMU Innovation Center and PEZ printing startup' },
    { title: '⚡ Supercomputer Hub', desc: 'NVIDIA DGX H100 AI Supercomputing facility', query: 'What research facilities and NVIDIA DGX H100 supercomputing hub exist at UIET?' },
    { title: '🏆 GATE Achievements', desc: 'Top AIR ranks & competitive exam coaching', query: 'What are the recent GATE achievements of UIET students?' },
    { title: '🏊 Campus Facilities', desc: 'Central library, sports complex & health center', query: 'What central library, sports complex, and medical facilities exist on campus?' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Red Alert Pill Banner (Matching Screenshot 2) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#A51C30] to-[#8B0000] text-white shadow-md">
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
          <span className="px-2.5 py-0.5 rounded bg-amber-400 text-csjmu-navy font-extrabold text-xs uppercase">ANNOUNCEMENT</span>
          <span>1st On Spot Counselling Session 2026-27 Results & Spot Counselling Open!</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCardClick('What is the procedure for B.Tech spot counselling round 3?')}
            className="px-3.5 py-1.5 rounded-xl bg-white text-[#A51C30] hover:bg-amber-300 font-extrabold text-xs transition-all shadow-sm"
          >
            Spot Counselling Info
          </button>
          <button
            onClick={() => handleCardClick('Check Round 3 counselling results and seat allotment')}
            className="px-3.5 py-1.5 rounded-xl bg-csjmu-navy hover:bg-slate-900 text-white font-bold text-xs border border-white/20 transition-all"
          >
            Round 3 Cutoffs
          </button>
        </div>
      </div>

      {/* Hero Aerial View Banner with AI Prompt Overlay (Matching Screenshot 1) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#002B49] via-slate-900 to-[#8B0000] p-8 sm:p-12 text-white shadow-2xl border-2 border-csjmu-gold/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A51C30] text-white border border-amber-400/40 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            NAAC A++ Accredited State University • Category 1 Status
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-extrabold tracking-tight text-white leading-tight">
            University Institute of Engineering and Technology
          </h1>

          <p className="text-xs sm:text-base text-slate-200 leading-relaxed font-normal">
            Official Intelligent Assistant for <strong>School of Engineering and Technology, Kanpur</strong>. Ask anything regarding B.Tech Admissions 2026-27, UP Post-Matric Fee Reimbursement, Placements, Supercomputing Hub, or PEZ Printing.
          </p>

          {/* Integrated Search Bar */}
          <form onSubmit={handleDirectSearch} className="relative max-w-2xl">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ask official AI Assistant (e.g. 'What is the eligibility for B.Tech CSE?')..."
              className="w-full h-14 pl-5 pr-16 rounded-2xl bg-white text-slate-900 font-medium text-sm border-2 border-amber-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-[#A51C30]"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 h-10 px-4 rounded-xl bg-[#A51C30] hover:bg-[#8B0000] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </section>

      {/* Main 2-Column Section (Matching Screenshot 1 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Useful Links Panel (Matching Screenshot 1) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
            <div className="border-b-2 border-[#A51C30] pb-2">
              <h2 className="text-base font-serif font-extrabold text-[#002B49] dark:text-white flex items-center gap-2">
                <span className="uni-bullet">➲</span>
                <span>Useful Links</span>
              </h2>
            </div>
            <div className="space-y-1.5">
              {usefulLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCardClick(link.query)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between group border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="uni-bullet text-[#A51C30]">➲</span>
                    <span className="truncate">{link.label}</span>
                  </div>
                  <span className="text-slate-400 group-hover:text-[#A51C30] text-xs">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Latest Notices & Announcements (Matching Screenshot 1) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
            <div className="border-b-2 border-[#A51C30] pb-2 flex items-center justify-between">
              <h2 className="text-base font-serif font-extrabold text-[#002B49] dark:text-white flex items-center gap-2">
                <span className="uni-bullet">➲</span>
                <span>Latest Notices & Announcements</span>
              </h2>
              <span className="text-xs font-semibold text-[#A51C30]">Updated Daily</span>
            </div>

            <div className="space-y-3">
              {latestNotices.map((notice, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCardClick(`Tell me details about notice: ${notice.title}`)}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#A51C30] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="uni-bullet text-[#A51C30] text-base">➲</span>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-[#A51C30] transition-colors">
                      {notice.title}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#A51C30]/10 text-[#A51C30] dark:text-amber-400 text-[11px] font-bold shrink-0">
                    {notice.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VC & Director Message Cards (Matching Screenshot 1) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#002B49] text-amber-400 font-serif font-extrabold flex items-center justify-center text-sm border-2 border-amber-400 shrink-0">
              VC
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#002B49] dark:text-white">Vice Chancellor&apos;s Message</h3>
              <p className="text-xs font-semibold text-[#A51C30]">Prof. Vinay Kumar Pathak</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
            &quot;The Institute is forging ahead to create engineers, scientists, and professionals of high competence to meet the technical challenges of tomorrow.&quot;
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#8B0000] text-white font-serif font-extrabold flex items-center justify-center text-sm border-2 border-amber-400 shrink-0">
              DIR
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#002B49] dark:text-white">Director&apos;s Message</h3>
              <p className="text-xs font-semibold text-[#A51C30]">Dr. Alok Kumar</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
            &quot;Our vision is to emerge as one of the premier educational and research institutes in engineering and technology.&quot;
          </p>
        </div>
      </section>

      {/* 10 Official Service Cards Section */}
      <section className="space-y-6">
        <div className="border-b-2 border-[#A51C30] pb-2 flex items-center justify-between">
          <h2 className="text-xl font-serif font-extrabold text-[#002B49] dark:text-white flex items-center gap-2">
            <span className="uni-bullet">➲</span>
            <span>Official University Service Directory</span>
          </h2>
          <span className="text-xs font-bold text-[#A51C30]">10 Categories Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <motion.button
              key={idx}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(cat.query)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-left shadow-sm hover:shadow-md hover:border-[#A51C30] transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#002B49] dark:text-white">
                  <span className="uni-bullet text-[#A51C30]">➲</span>
                  <span>{cat.title}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {cat.desc}
                </p>
              </div>
              <span className="mt-4 text-xs font-bold text-[#A51C30] dark:text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                Ask AI Assistant →
              </span>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
