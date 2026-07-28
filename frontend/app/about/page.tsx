'use client';

import React from 'react';
import { ShieldCheck, Cpu, Printer, Sparkles, Building, Award, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#002B49]/10 dark:bg-amber-400/10 text-[#002B49] dark:text-amber-300 text-xs font-semibold border border-[#002B49]/20 dark:border-amber-400/20">
          <ShieldCheck className="w-4 h-4 text-[#8B0000] dark:text-amber-400" />
          <span>NAAC A++ Grade Accredited State University • Established 1966</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#002B49] dark:text-white tracking-tight">
          About CSJMU & UIET Kanpur
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Chhatrapati Shahu Ji Maharaj University (CSJMU), Kanpur is a landmark institution of higher education, scientific research, and technological advancement in Uttar Pradesh. The University Institute of Engineering & Technology (UIET) serves as its flagship engineering school.
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-amber-300 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#002B49] dark:text-white">
            UIET School of Engineering
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            UIET offers B.Tech programs in Computer Science & Engineering, Electronics & Communication, Chemical Engineering, Mechanical Engineering, Materials Science & Metallurgical Engineering, as well as MCA, BCA, and vocational degree courses.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>AICTE Approved & NAAC A++ Accredited</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Faculty from IITs, NITs, and premier universities</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-amber-300 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#002B49] dark:text-white">
            NVIDIA DGX H100 Supercomputing Hub
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            UIET houses an advanced AI Supercomputing facility powered by NVIDIA DGX H100 GPU nodes. The center facilitates research in large language modeling, computer vision, computational chemistry, and bioinformatics.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>High-performance multi-GPU compute cluster</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Dedicated research grants for undergraduate projects</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-amber-300 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#002B49] dark:text-white">
            Innovation Center & Incubation Cell
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The CSJMU Innovation Center provides incubation support, AICTE IDEA Lab rapid prototyping equipment, 3D printing facilities, and seed money funding for student startups.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>AICTE IDEA Lab Prototyping Workshop</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Seed capital funding up to 5 Lakhs</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-amber-300 flex items-center justify-center font-bold">
            <Printer className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#002B49] dark:text-white">
            PEZ Smart Campus Printing Startup
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            An indigenous campus startup incubatee providing automated QR code document printing across student hostels and central libraries with instant UPI payment and zero-data retention security.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Instant QR code print queues</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>100% secure file deletion post-print</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
