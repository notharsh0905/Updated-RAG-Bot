'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t-4 border-[#A51C30] bg-[#002B49] text-white py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-300">
        
        {/* Col 1: Institutional Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8B0000] border border-amber-400 text-white font-serif font-bold flex items-center justify-center text-[10px]">
              CSJMU
            </div>
            <div>
              <span className="font-serif font-extrabold text-sm text-white block">
                UIET Kanpur
              </span>
              <span className="text-[11px] text-amber-300">
                School of Engineering & Technology
              </span>
            </div>
          </div>
          <p className="leading-relaxed">
            Chhatrapati Shahu Ji Maharaj University, Kanpur is accredited with <strong>NAAC A++ grade</strong> and Category 1 status by UGC.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-2">
          <h4 className="font-serif font-extrabold text-sm text-amber-300 border-b border-white/20 pb-1">
            Quick Links
          </h4>
          <ul className="space-y-1.5">
            <li>
              <Link href="/about" className="hover:text-amber-300 transition-colors">
                • About UIET & CSJMU
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:text-amber-300 transition-colors">
                • Help & FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-amber-300 transition-colors">
                • Official Department Contacts
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-amber-300 font-bold transition-colors">
                • University Official Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Academic Programs */}
        <div className="space-y-2">
          <h4 className="font-serif font-extrabold text-sm text-amber-300 border-b border-white/20 pb-1">
            Engineering Wings
          </h4>
          <ul className="space-y-1">
            <li>• Computer Science & Engineering (CSE)</li>
            <li>• Electronics & Communication (ECE)</li>
            <li>• Chemical & Mechanical Engineering</li>
            <li>• Materials Science & Metallurgical (MSME)</li>
            <li>• BCA, MCA & Vocational Studies</li>
          </ul>
        </div>

        {/* Col 4: Address & Helpline */}
        <div className="space-y-2">
          <h4 className="font-serif font-extrabold text-sm text-amber-300 border-b border-white/20 pb-1">
            Campus Address
          </h4>
          <p className="leading-relaxed flex items-start gap-1.5">
            <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <span>CSJMU Campus, Kalyanpur, Kanpur, Uttar Pradesh - 208024</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-amber-300 shrink-0" />
            <span>admission@csjmu.ac.in</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <p>© 2026 <strong>Chhatrapati Shahu Ji Maharaj University (CSJMU) & UIET Kanpur</strong>. All rights reserved.</p>
        <p className="text-amber-300 font-semibold">Official AI Assistant Portal</p>
      </div>
    </footer>
  );
};
