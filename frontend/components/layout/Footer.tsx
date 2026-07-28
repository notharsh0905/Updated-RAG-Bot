'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t-2 border-[#8B0000] bg-[#002B49] text-white py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-300">
        
        {/* Col 1: Official CSJMU Institutional Branding */}
        <div className="space-y-4">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm max-w-[260px]">
            <img
              src="/images/csjmu-banner-logo.png"
              alt="Chhatrapati Shahu Ji Maharaj University Kanpur Wide Logo"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="leading-relaxed text-slate-300">
            Chhatrapati Shahu Ji Maharaj University (CSJMU), Kanpur is accredited with <strong className="text-amber-300 font-semibold">NAAC A++ Grade</strong> and Category-1 Status by UGC.
          </p>
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Uttar Pradesh State University</span>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-2.5">
          <h4 className="font-serif font-bold text-sm text-amber-300 border-b border-white/20 pb-1.5">
            Institutional Navigation
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="hover:text-white transition-colors flex items-center gap-1">
                <span>About UIET & CSJMU</span>
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:text-white transition-colors flex items-center gap-1">
                <span>Help & Student FAQ</span>
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1">
                <span>Official Contact Directory</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="text-amber-300 font-semibold hover:underline flex items-center gap-1">
                <span>University Admin Login</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Academic Schools */}
        <div className="space-y-2.5">
          <h4 className="font-serif font-bold text-sm text-amber-300 border-b border-white/20 pb-1.5">
            Engineering & Technology
          </h4>
          <ul className="space-y-1.5 text-slate-300">
            <li>Computer Science & Engineering (CSE)</li>
            <li>Electronics & Communication (ECE)</li>
            <li>Chemical & Mechanical Engineering</li>
            <li>Materials Science & Metallurgical (MSME)</li>
            <li>BCA, MCA & Vocational Studies</li>
          </ul>
        </div>

        {/* Col 4: Campus Contact & Helpdesk */}
        <div className="space-y-2.5">
          <h4 className="font-serif font-bold text-sm text-amber-300 border-b border-white/20 pb-1.5">
            Campus Address
          </h4>
          <p className="leading-relaxed flex items-start gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <span>CSJMU Campus, Kalyanpur, Kanpur, Uttar Pradesh - 208024</span>
          </p>
          <p className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-amber-300 shrink-0" />
            <span>admission@csjmu.ac.in</span>
          </p>
          <a
            href="https://csjmu.ac.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-colors mt-2"
          >
            <span>Visit Main University Website</span>
            <ExternalLink className="w-3 h-3 text-amber-300" />
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto border-t border-white/10 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <p>© 2026 <strong>Chhatrapati Shahu Ji Maharaj University (CSJMU)</strong> & UIET Kanpur. All rights reserved.</p>
        <p className="text-amber-300 font-medium">Official Enterprise AI Portal</p>
      </div>
    </footer>
  );
};
