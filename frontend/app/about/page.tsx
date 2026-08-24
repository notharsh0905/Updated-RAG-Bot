'use client';

import React from 'react';
import { ShieldCheck, Cpu, Printer, Sparkles, Building, Quote } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#002B49]/10 dark:bg-[#1268D4]/10 text-[#002B49] dark:text-[#1E88FF] text-xs font-semibold border border-[#002B49]/20 dark:border-[#1E88FF]/20">
          <ShieldCheck className="w-4 h-4 text-[#1268D4] dark:text-[#1E88FF]" />
          <span>NAAC A++ Grade Accredited State University • Established 1966</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#002B49] dark:text-white tracking-tight">
          About CSJMU & UIET Kanpur
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Chhatrapati Shahu Ji Maharaj University (CSJMU), Kanpur is a landmark institution of higher education, scientific research, and technological advancement in Uttar Pradesh. The University Institute of Engineering & Technology (UIET) serves as its flagship engineering school.
        </p>
      </div>

      {/* Official Leadership Section */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
          <h2 className="text-lg font-serif font-bold text-[#002B49] dark:text-white flex items-center gap-2">
            <span className="uni-bullet">➲</span>
            <span>University Leadership</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vice Chancellor Profile */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#002B49] dark:border-[#1E88FF] shadow-md shrink-0 bg-slate-100 relative">
                <img
                  src="/images/vc-portrait.jpg"
                  alt="Prof. Vinay Kumar Pathak"
                  loading="lazy"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#002B49] dark:text-white">
                  Prof. Vinay Kumar Pathak
                </h3>
                <p className="text-xs font-bold text-[#1268D4] dark:text-[#1E88FF]">
                  Hon'ble Vice Chancellor
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  CSJMU Kanpur
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
              <Quote className="w-5 h-5 text-[#1268D4]/20 dark:text-[#1E88FF]/20 absolute right-3 top-3" />
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                &quot;Our mission is to empower students through cutting-edge technology, research innovation, and world-class academic infrastructure.&quot;
              </p>
            </div>
          </div>

          {/* Director UIET Profile */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#1268D4] dark:border-[#1E88FF] shadow-md shrink-0 bg-slate-100 relative">
                <img
                  src="/images/director-portrait.jpg"
                  alt="Prof. (Dr.) Alok Kumar"
                  loading="lazy"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#002B49] dark:text-white">
                  Prof. (Dr.) Alok Kumar
                </h3>
                <p className="text-xs font-bold text-[#1268D4] dark:text-[#1E88FF]">
                  Director, UIET Kanpur
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  School of Engineering & Technology
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
              <Quote className="w-5 h-5 text-[#1268D4]/20 dark:text-[#1E88FF]/20 absolute right-3 top-3" />
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                &quot;UIET is committed to fostering engineering excellence, startup incubation, and supercomputing research for sustainable growth.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-[#1E88FF] flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#002B49] dark:text-white">
            UIET School of Engineering
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            UIET offers B.Tech programs in Computer Science & Engineering, Electronics & Communication, Chemical Engineering, Mechanical Engineering, Materials Science & Metallurgical Engineering, as well as MCA, BCA, and vocational degree courses.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-[#1E88FF] flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#002B49] dark:text-white">
            NVIDIA DGX H100 Supercomputing Hub
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            UIET houses an advanced AI Supercomputing facility powered by NVIDIA DGX H100 GPU nodes. The center facilitates research in large language modeling, computer vision, computational chemistry, and bioinformatics.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-[#1E88FF] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#002B49] dark:text-white">
            Innovation Center & Incubation Cell
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The CSJMU Innovation Center provides incubation support, AICTE IDEA Lab rapid prototyping equipment, 3D printing facilities, and seed money funding for student startups.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-[#1E88FF] flex items-center justify-center font-bold">
            <Printer className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-[#002B49] dark:text-white">
            PEZ Smart Campus Printing Startup
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            An indigenous campus startup incubatee providing automated QR code document printing across student hostels and central libraries with instant UPI payment and zero-data retention security.
          </p>
        </div>
      </div>

      {/* Official Project Credits & Development Team Section */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
          <h2 className="text-lg font-serif font-bold text-[#002B49] dark:text-white flex items-center gap-2">
            <span className="uni-bullet">➲</span>
            <span>Project Credits & R&D Development Team</span>
          </h2>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 px-3 py-1 rounded-full border border-blue-200 dark:border-cyan-500/20">
                Release v3.0.0 (Production 2026)
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                CSJMU AI Smart Student Help Desk & RAG Platform
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                University Institute of Engineering & Technology (UIET), CSJMU Kanpur
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Academic Guide */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-[#1E88FF]">
                Academic Project Guide
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Assistant Professor Gayatri Rajpoot</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Faculty of Computer Science & Engineering</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">UIET CSJMU Kanpur</p>
              </div>
            </div>

            {/* Lead Developer */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-cyan-400">
                Lead Software Architect & Developer
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Harsh Upadhyay</h4>
                <p className="text-[11px] text-blue-700 dark:text-cyan-300 font-mono font-semibold">B.Tech CSE (2K24)</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Full-Stack RAG & System Architecture</p>
              </div>
            </div>

            {/* Engineering Team */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Engineering Team Members
              </span>
              <div className="space-y-1.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Nikhil Kumar</h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">B.Tech CSE AI (2K23)</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Priyanshi Yadav</h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">B.Tech CSE AI (2K23)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
