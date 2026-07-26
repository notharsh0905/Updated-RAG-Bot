'use client';

import React from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How do I apply for B.Tech admission at UIET Kanpur?',
      a: 'Admission to B.Tech programs is conducted through CSJM University B.Tech Admission Portal strictly based on JEE Mains rank and counseling procedure.',
    },
    {
      q: 'What scholarships and fee waivers are available?',
      a: 'Eligible students can apply for UP Government Post-Matric Fee Reimbursement schemes (subject to family income limits and approved non-refundable fees) and National Scholarship Portal (NSP) schemes.',
    },
    {
      q: 'Does UP Government provide free tablets or smartphones?',
      a: 'Yes! Eligible students receive free tablets/smartphones under the UP Government Swami Vivekananda Youth Empowerment Scheme.',
    },
    {
      q: 'What is the highest placement package at UIET?',
      a: 'Students have achieved top domestic packages of 16 LPA (Quizizz) and 15 LPA (Cadence Design Systems) with top recruiters including TCS, Jio Platforms, and Sopra Steria.',
    },
    {
      q: 'How does the PEZ Smart Printing service work?',
      a: 'Students scan the PEZ QR code, upload documents via mobile browser, pay digitally, and print instantly with 100% automated file deletion for security.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-csjmu-blue dark:text-csjmu-gold text-xs font-bold uppercase">
          <HelpCircle className="w-4 h-4" />
          Student Help Center
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Instant answers to common student inquiries regarding admissions, scholarships, and campus facilities.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2"
          >
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-csjmu-gold shrink-0" />
              {faq.q}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-csjmu-navy text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base">Have more specific questions?</h3>
          <p className="text-xs text-slate-300">Launch the AI Assistant to get instant grounded answers.</p>
        </div>
        <Link
          href="/chat"
          className="px-5 py-2.5 rounded-xl bg-csjmu-gold text-csjmu-navy font-bold text-xs hover:bg-amber-400 transition-all shrink-0"
        >
          Ask AI Assistant
        </Link>
      </div>
    </div>
  );
}
