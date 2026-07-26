'use client';

import React from 'react';
import { GraduationCap, ShieldCheck, Cpu, Printer, Sparkles, Building, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-csjmu-navy/10 dark:bg-csjmu-blue/30 text-csjmu-navy dark:text-csjmu-gold text-xs font-bold uppercase">
          <ShieldCheck className="w-4 h-4" />
          NAAC A++ Grade Accredited State University
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About CSJMU & UIET Kanpur
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Chhatrapati Shahu Ji Maharaj University (CSJMU), Kanpur is one of the premier state universities in Uttar Pradesh. Established in 1966, CSJMU has grown into a major hub of higher education, research, innovation, and technological development.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-csjmu-navy text-csjmu-gold flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            UIET Engineering School
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            University Institute of Engineering & Technology (UIET) offers B.Tech programs in Computer Science & Engineering, Electronics & Communication, Chemical Engineering, Mechanical Engineering, Materials Science & Metallurgical Engineering, as well as MCA and BCA courses.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-csjmu-navy text-csjmu-gold flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            NVIDIA DGX H100 Supercomputing Hub
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            UIET houses an advanced Artificial Intelligence Supercomputing Hub equipped with NVIDIA DGX H100 GPU architecture, supporting high-throughput research in AI, deep learning, computer vision, and computational biology.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-csjmu-navy text-csjmu-gold flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Innovation Center & Startup Cell
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The Innovation Center incubates student startups, provides AICTE IDEA Lab prototyping tools, drone development facilities, and seed funding support.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-csjmu-navy text-csjmu-gold flex items-center justify-center font-bold">
            <Printer className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            PEZ Smart Campus Printing Startup
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            An indigenous campus startup delivering instant QR code printing, automated payment, and 100% secure file deletion for student document printing.
          </p>
        </div>
      </div>
    </div>
  );
}
