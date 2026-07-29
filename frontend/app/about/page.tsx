'use client';

import React from 'react';
import { ShieldCheck, Cpu, Printer, Sparkles, Building, Quote } from 'lucide-react';

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
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#002B49] dark:border-amber-400 shadow-md shrink-0 bg-slate-100 relative">
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
                <p className="text-xs font-bold text-[#8B0000] dark:text-amber-400">
                  Hon'ble Vice Chancellor
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  CSJMU Kanpur
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
              <Quote className="w-5 h-5 text-[#8B0000]/20 dark:text-amber-400/20 absolute right-3 top-3" />
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                &quot;Our mission is to empower students through cutting-edge technology, research innovation, and world-class academic infrastructure.&quot;
              </p>
            </div>
          </div>

          {/* Director UIET Profile */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#8B0000] dark:border-amber-400 shadow-md shrink-0 bg-slate-100 relative">
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
                <p className="text-xs font-bold text-[#8B0000] dark:text-amber-400">
                  Director, UIET Kanpur
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  School of Engineering & Technology
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
              <Quote className="w-5 h-5 text-[#8B0000]/20 dark:text-amber-400/20 absolute right-3 top-3" />
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
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-amber-300 flex items-center justify-center font-bold">
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
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-amber-300 flex items-center justify-center font-bold">
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
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-amber-300 flex items-center justify-center font-bold">
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
          <div className="w-10 h-10 rounded-lg bg-[#002B49] text-amber-300 flex items-center justify-center font-bold">
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
    </div>
  );
}
