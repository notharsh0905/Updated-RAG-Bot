'use client';

import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Official University Contact
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Reach out to CSJMU & UIET administration, admissions office, or placement cell.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-csjmu-navy text-csjmu-gold flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Email Helplines</h3>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <li><strong>Admissions:</strong> admission@csjmu.ac.in</li>
            <li><strong>Placements:</strong> placements@uiet.ac.in</li>
            <li><strong>Director Office:</strong> director@uiet.ac.in</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-csjmu-navy text-csjmu-gold flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Campus Location</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Chhatrapati Shahu Ji Maharaj University (CSJMU)<br />
            Kalyanpur, Kanpur, Uttar Pradesh - 208024
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-csjmu-navy text-csjmu-gold flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Official Websites</h3>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <li><strong>CSJMU Portal:</strong> <a href="https://csjmu.ac.in" target="_blank" rel="noreferrer" className="text-csjmu-blue dark:text-amber-400 hover:underline">csjmu.ac.in</a></li>
            <li><strong>UIET Engineering:</strong> <a href="https://uiet.csjmu.ac.in" target="_blank" rel="noreferrer" className="text-csjmu-blue dark:text-amber-400 hover:underline">uiet.csjmu.ac.in</a></li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-csjmu-navy text-csjmu-gold flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Phone Support</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Admissions Enquiry:</strong> +91-512-2580044<br />
            <strong>Helpline Hours:</strong> Mon - Sat (10:00 AM - 5:00 PM)
          </p>
        </div>
      </div>
    </div>
  );
}
