'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Search,
  Send,
  ArrowRight,
  BookOpen,
  DollarSign,
  Briefcase,
  Home as HomeIcon,
  Building,
  GraduationCap,
  Sparkles,
  Cpu,
  Award,
  Calendar,
  ChevronRight,
  Quote,
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
    { label: 'M. Tech & Lateral Entry Admissions', query: 'What is the eligibility for M.Tech & lateral entry admissions?' },
    { label: 'Academic & Exam Calendar 2026', query: 'What academic calendar and exam schedules are active?' },
    { label: 'Placements & Companies 2024-25', query: 'What is the highest placement package and top recruiters at UIET?' },
    { label: 'UP Post-Matric Fee Reimbursement', query: 'What scholarships and UP fee reimbursement rules apply?' },
    { label: 'Supercomputing Facility (NVIDIA DGX H100)', query: 'What research facilities and NVIDIA DGX H100 supercomputer exist?' },
    { label: 'AICTE Downloads & Course Syllabus', query: 'Where can I find the complete course syllabus and curriculum?' },
  ];

  const latestNotices = [
    { title: '1st On Spot Counselling Session 2026-27 Results Declared', tag: 'Admissions' },
    { title: 'Regular and Backloggers Registration Schedule 2025-26', tag: 'Academic' },
    { title: 'B.Tech Final Semester Examination Timetable Released', tag: 'Exams' },
    { title: 'UIET GATE 2024 Achievers AIR Rank Announcement', tag: 'Achievement' },
    { title: 'Campus Incubation & PEZ Printing Grant Winners', tag: 'Innovation' },
  ];

  const categories = [
    { title: 'B.Tech Admissions', desc: 'Eligibility, JEE Mains cutoffs & counselling', query: 'What is the admission procedure for B.Tech CSE at UIET?', icon: BookOpen },
    { title: 'Fees & Reimbursement', desc: 'Fee structures & UP Post-Matric aid', query: 'What scholarships and fee reimbursement rules apply?', icon: DollarSign },
    { title: 'Placements & Careers', desc: '16 LPA highest package & recruiters', query: 'What is the highest placement package and top recruiters at UIET Kanpur?', icon: Briefcase },
    { title: 'Hostels & Mess', desc: 'Facilities, mess fees, and security rules', query: 'What hostel facilities, mess, rules, and curfew timings exist at CSJMU?', icon: HomeIcon },
    { title: 'UIET Engineering Departments', desc: 'CSE, ECE, Chemical, Mechanical & MSME', query: 'What engineering departments and programs exist under UIET?', icon: Building },
    { title: 'Faculty & Research', desc: 'IIT/NIT Ph.D. professors & publications', query: 'Tell me about the faculty background and mentorship at UIET.', icon: GraduationCap },
    { title: 'Innovation Center', desc: 'AICTE IDEA Lab & prototype incubation', query: 'Tell me about the CSJMU Innovation Center and startup cell', icon: Sparkles },
    { title: 'AI Supercomputing Hub', desc: 'NVIDIA DGX H100 high-performance cluster', query: 'What research facilities and NVIDIA DGX H100 supercomputing hub exist at UIET?', icon: Cpu },
    { title: 'GATE Ranks & Achievements', desc: 'All India Ranks & competitive exam success', query: 'What are the recent GATE achievements of UIET students?', icon: Award },
    { title: 'Campus Infrastructure', desc: 'Central library, sports complex & health center', query: 'What central library, sports complex, and medical facilities exist on campus?', icon: Calendar },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Official Ticker Announcement Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#002B49] text-white shadow-sm border border-slate-700">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-2 py-0.5 rounded bg-[#8B0000] text-white text-[10px] font-bold uppercase tracking-wider">
            ANNOUNCEMENT
          </span>
          <span className="truncate">1st On Spot Counselling Session 2026-27 Results & Seat Allotment Open</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleCardClick('What is the procedure for B.Tech spot counselling round 3?')}
            className="px-3 py-1 rounded bg-[#8B0000] hover:bg-red-800 text-white font-semibold text-xs transition-colors"
          >
            Spot Counselling Details
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#8B0000] dark:text-amber-400" />
            <span>NAAC A++ Accredited State University • Category-1 Status</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-[#002B49] dark:text-white tracking-tight leading-tight">
              Chhatrapati Shahu Ji Maharaj University, Kanpur
            </h1>
            <p className="text-base sm:text-lg font-semibold text-[#8B0000] dark:text-amber-400">
              University Institute of Engineering and Technology (UIET) Enterprise AI Portal
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Welcome to the official intelligent assistant for UIET Kanpur. Search or ask questions regarding B.Tech admissions 2026-27, UP Post-Matric fee waivers, department curricula, placement metrics, or supercomputing research facilities.
          </p>

          {/* Integrated Enterprise Search Bar */}
          <form onSubmit={handleDirectSearch} className="relative max-w-2xl pt-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Ask official AI Assistant (e.g. 'What is the eligibility for B.Tech CSE?')..."
                className="w-full h-12 pl-11 pr-24 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium border border-slate-300 dark:border-slate-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 h-9 px-4 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Consult AI</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Useful Links Directory */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <h2 className="text-sm font-bold text-[#002B49] dark:text-white flex items-center gap-2 uppercase tracking-wide">
                <span className="uni-bullet">➲</span>
                <span>University Quick Links</span>
              </h2>
            </div>
            <div className="space-y-1">
              {usefulLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCardClick(link.query)}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-between group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <span className="truncate pr-2">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#8B0000] dark:group-hover:text-amber-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Latest Notices & Announcements */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#002B49] dark:text-white flex items-center gap-2 uppercase tracking-wide">
                <span className="uni-bullet">➲</span>
                <span>Latest University Notices</span>
              </h2>
              <span className="text-xs font-medium text-slate-500">Updated Daily</span>
            </div>

            <div className="space-y-2">
              {latestNotices.map((notice, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCardClick(`Tell me details about notice: ${notice.title}`)}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 pr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] dark:bg-amber-400 shrink-0" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-[#002B49] dark:group-hover:text-white transition-colors">
                      {notice.title}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold shrink-0">
                    {notice.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Official University Leadership Cards with Photographs */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
          <h2 className="text-base font-serif font-bold text-[#002B49] dark:text-white flex items-center gap-2">
            <span className="uni-bullet">➲</span>
            <span>University Leadership Messages</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Institutional Mentors</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vice Chancellor Profile Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-start gap-4">
              {/* Circular Portrait Image */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#002B49] dark:border-amber-400 shadow-md shrink-0 bg-slate-100 relative">
                <img
                  src="/images/vc-portrait.jpg"
                  alt="Prof. Vinay Kumar Pathak"
                  loading="lazy"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#002B49] dark:text-white tracking-tight">
                  Prof. Vinay Kumar Pathak
                </h3>
                <p className="text-xs font-bold text-[#8B0000] dark:text-amber-400">
                  Hon'ble Vice Chancellor, CSJMU Kanpur
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Chhatrapati Shahu Ji Maharaj University
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 relative">
              <Quote className="w-5 h-5 text-[#8B0000]/20 dark:text-amber-400/20 absolute right-3 top-3" />
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                &quot;CSJMU is forging ahead to create engineers, scientists, and professionals of high competence to meet the technical challenges of tomorrow and serve society through innovation.&quot;
              </p>
            </div>
          </div>

          {/* Director UIET Profile Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-start gap-4">
              {/* Circular Portrait Image */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#8B0000] dark:border-amber-400 shadow-md shrink-0 bg-slate-100 relative">
                <img
                  src="/images/director-portrait.jpg"
                  alt="Prof. (Dr.) Alok Kumar"
                  loading="lazy"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#002B49] dark:text-white tracking-tight">
                  Prof. (Dr.) Alok Kumar
                </h3>
                <p className="text-xs font-bold text-[#8B0000] dark:text-amber-400">
                  Director, UIET Kanpur
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  School of Engineering & Technology
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 relative">
              <Quote className="w-5 h-5 text-[#8B0000]/20 dark:text-amber-400/20 absolute right-3 top-3" />
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                &quot;Our vision is to emerge as one of the premier educational and research institutes in engineering, providing state-of-the-art supercomputing, incubation, and academic excellence.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Service Directory */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5 flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-[#002B49] dark:text-white flex items-center gap-2">
            <span className="uni-bullet">➲</span>
            <span>Official University Service Directory</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">10 Primary Categories</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => handleCardClick(cat.query)}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left shadow-sm hover:border-[#002B49] dark:hover:border-amber-400/60 transition-colors flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#002B49] dark:text-white">
                    <Icon className="w-4 h-4 text-[#8B0000] dark:text-amber-400 shrink-0" />
                    <span className="truncate">{cat.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-3 text-[11px] font-semibold text-[#002B49] dark:text-amber-400 group-hover:underline inline-flex items-center gap-1">
                  <span>Consult Assistant</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
