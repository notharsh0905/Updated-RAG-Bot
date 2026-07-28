'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Bot, HelpCircle, ArrowRight } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  aiQuery: string;
}

export default function HelpPage() {
  const router = useRouter();
  const { setPendingQuestion } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const handleAskAI = (query: string) => {
    setPendingQuestion(query);
    router.push('/chat');
  };

  const faqs: FAQItem[] = [
    {
      category: 'Admissions & Eligibility',
      question: 'What is the admission procedure for B.Tech CSE at UIET Kanpur?',
      answer: 'Admissions to B.Tech Computer Science & Engineering at UIET are conducted through NTA JEE Mains ranks followed by AKTU / CSJMU counseling rounds. 10% seats are filled via spot counseling rounds based on merit.',
      aiQuery: 'What is the step by step admission procedure for B.Tech CSE at UIET Kanpur?',
    },
    {
      category: 'Fee Waiver & Scholarships',
      question: 'How do UP Post-Matric Fee Reimbursements work for engineering students?',
      answer: 'Eligible domicile students of Uttar Pradesh whose family annual income falls below the prescribed threshold (2 Lakhs for SC/ST, 2 Lakhs for OBC/General) can apply on the UP Scholarship Portal (scholarship.up.gov.in) for 100% fee reimbursement.',
      aiQuery: 'What are the rules and income criteria for UP Post-Matric scholarship fee reimbursement at CSJMU?',
    },
    {
      category: 'Placements & Careers',
      question: 'What are the recent placement metrics and top recruiters at UIET?',
      answer: 'UIET students secured placement packages up to 16 LPA. Top campus recruiters include TCS Digital, Infosys, Wipro, Cognizant, Reliance Industries, HCL Technologies, and Paytm.',
      aiQuery: 'What is the highest placement package, average salary, and recruiters list for UIET CSE?',
    },
    {
      category: 'Hostel & Campus Facilities',
      question: 'What are the hostel rules, mess charges, and curfew timings at CSJMU?',
      answer: 'CSJMU provides separate boys and girls hostels on campus with 24x7 Wi-Fi, bio-metric attendance, mess food, and security guards. Curfew timing for student hostels is 9:30 PM.',
      aiQuery: 'Tell me about CSJMU hostel fee, mess rules, security, and curfew timings',
    },
    {
      category: 'AI Supercomputer & Innovation',
      question: 'Who can access the NVIDIA DGX H100 Supercomputing Hub and Innovation Center?',
      answer: 'UIET B.Tech final year students, M.Tech scholars, and faculty conducting approved research in AI, Machine Learning, and Computer Vision can request GPU compute access through the Dean of Engineering.',
      aiQuery: 'How can students apply for compute access at the NVIDIA DGX H100 supercomputer hub?',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#002B49] dark:text-white tracking-tight">
          Help & Student FAQ Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Frequently asked questions regarding CSJMU admissions, scholarships, hostels, and AI consultation
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search FAQs (e.g. 'hostel curfew', 'fee reimbursement', 'spot round')..."
          className="w-full h-12 pl-11 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400 shadow-sm"
        />
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#8B0000] dark:text-amber-400 shrink-0" />
                  <span>{faq.question}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <p className="leading-relaxed">{faq.answer}</p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                      Category: {faq.category}
                    </span>
                    <button
                      onClick={() => handleAskAI(faq.aiQuery)}
                      className="px-3 py-1 rounded bg-[#002B49] hover:bg-[#001D33] text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Bot className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ask AI for Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
            No matching FAQ found. Try asking our official AI Assistant directly.
          </div>
        )}
      </div>
    </div>
  );
}
