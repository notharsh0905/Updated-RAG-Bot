'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="
        w-full
        mt-auto
        border-t-2
        border-[#8B0000]
        bg-[#002B49]
        text-white
        py-8
        sm:py-10
        lg:py-12
        px-5
        sm:px-8
        lg:px-10
        xl:px-12
      "
    >
      <div
        className="
          max-w-screen-2xl
          mx-auto
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-10
          text-[12px]
          sm:text-xs
          lg:text-sm
          text-slate-300
        "
      >
        {/* ==========================================================
            Column 1
        =========================================================== */}

        <div
          className="
            flex
            flex-col
            items-center
            sm:items-start
            text-center
            sm:text-left
            space-y-4
          "
        >
          <div
            className="
              bg-white
              rounded-lg
              border
              border-slate-200
              shadow-sm
              p-2
              sm:p-3
              w-full
              max-w-[220px]
              sm:max-w-[250px]
              lg:max-w-[280px]
            "
          >
            <img
              src="/images/csjmu-banner-logo.png"
              alt="Chhatrapati Shahu Ji Maharaj University Kanpur Wide Logo"
              className="w-full h-auto object-contain"
            />
          </div>

          <p className="leading-relaxed text-slate-300">
            Chhatrapati Shahu Ji Maharaj University (CSJMU), Kanpur is
            accredited with{' '}
            <strong className="text-amber-300 font-semibold">
              NAAC A++ Grade
            </strong>{' '}
            and Category-1 Status by UGC.
          </p>

          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Uttar Pradesh State University</span>
          </div>
        </div>

        {/* ==========================================================
            Column 2
        =========================================================== */}

        <div
          className="
            flex
            flex-col
            items-center
            sm:items-start
            text-center
            sm:text-left
            space-y-3
          "
        >
          <h4
            className="
              font-serif
              font-bold
              text-base
              text-amber-300
              border-b
              border-white/20
              pb-2
              w-full
            "
          >
            Institutional Navigation
          </h4>

          <ul className="space-y-3 w-full">
            <li>
              <Link
                href="/about"
                className="
                  flex
                  items-center
                  justify-center
                  sm:justify-start
                  gap-1
                  hover:text-white
                  transition-colors
                "
              >
                <span>About UIET & CSJMU</span>
              </Link>
            </li>

            <li>
              <Link
                href="/help"
                className="
                  flex
                  items-center
                  justify-center
                  sm:justify-start
                  gap-1
                  hover:text-white
                  transition-colors
                "
              >
                <span>Help & Student FAQ</span>
              </Link>
            </li>

            <li>
              <Link
                href="/contact"
                className="
                  flex
                  items-center
                  justify-center
                  sm:justify-start
                  gap-1
                  hover:text-white
                  transition-colors
                "
              >
                <span>Official Contact Directory</span>
              </Link>
            </li>

            <li>
              <Link
                href="/admin/login"
                className="
                  flex
                  items-center
                  justify-center
                  sm:justify-start
                  gap-1
                  text-amber-300
                  font-semibold
                  hover:underline
                "
              >
                <span>University Admin Login</span>
              </Link>
            </li>
          </ul>
        </div>
        {/* ==========================================================
            Column 3
        =========================================================== */}

        <div
          className="
            flex
            flex-col
            items-center
            sm:items-start
            text-center
            sm:text-left
            space-y-3
          "
        >
          <h4
            className="
              font-serif
              font-bold
              text-base
              text-amber-300
              border-b
              border-white/20
              pb-2
              w-full
            "
          >
            Engineering & Technology
          </h4>

          <ul className="space-y-2 text-slate-300 w-full">
            <li>Computer Science & Engineering (CSE)</li>
            <li>Electronics & Communication (ECE)</li>
            <li>Chemical & Mechanical Engineering</li>
            <li>Materials Science & Metallurgical (MSME)</li>
            <li>BCA, MCA & Vocational Studies</li>
          </ul>
        </div>

        {/* ==========================================================
            Column 4
        =========================================================== */}

        <div
          className="
            flex
            flex-col
            items-center
            sm:items-start
            text-center
            sm:text-left
            space-y-3
          "
        >
          <h4
            className="
              font-serif
              font-bold
              text-base
              text-amber-300
              border-b
              border-white/20
              pb-2
              w-full
            "
          >
            Campus Address & Helpline
          </h4>

          <p
            className="
              flex
              items-start
              justify-center
              sm:justify-start
              gap-2
              leading-relaxed
              w-full
            "
          >
            <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <span className="break-words">
              CSJMU Campus, Kalyanpur, Kanpur,
              Uttar Pradesh - 208024
            </span>
          </p>

          <p
            className="
              flex
              items-center
              justify-center
              sm:justify-start
              gap-2
              w-full
            "
          >
            <Mail className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="break-all">
              admission@csjmu.ac.in
            </span>
          </p>

          <p
            className="
              flex
              items-center
              justify-center
              sm:justify-start
              gap-2
              w-full
            "
          >
            <Phone className="w-4 h-4 text-amber-300 shrink-0" />
            <span>+91 0512-2580044 / 2581261</span>
          </p>

          <a
            href="https://csjmu.ac.in"
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex
              w-full
              sm:w-auto
              justify-center
              items-center
              gap-2
              rounded-md
              border
              border-white/20
              bg-white/10
              hover:bg-white/20
              px-4
              py-2
              text-white
              transition-colors
            "
          >
            <span>Visit Main University Website</span>
            <ExternalLink className="w-3 h-3 text-amber-300" />
          </a>
        </div>
      </div>

      {/* ==========================================================
          Credits
      =========================================================== */}

      <div
        className="
          max-w-screen-2xl
          mx-auto
          mt-10
          pt-6
          border-t
          border-white/10
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-8
          text-[11px]
          sm:text-xs
          text-slate-300
        "
      >
        <div
          className="
            text-center
            lg:text-left
            space-y-2
          "
        >
          <p className="font-semibold uppercase tracking-wider text-[10px] text-amber-300">
            Academic R&D Project Credits
          </p>

          <p>
            <strong className="text-white">
              Academic Project Guide:
            </strong>{' '}
            Assistant Professor Gayatri Rajpoot
          </p>

          <p>
            <strong className="text-white">
              Lead Developer:
            </strong>{' '}
            Harsh Upadhyay (B.Tech CSE 2K24)
          </p>

          <p>
            <strong className="text-white">
              Engineering Team:
            </strong>{' '}
            Nikhil Kumar (B.Tech CSE AI 2K23) &
            Priyanshi Yadav (B.Tech CSE AI 2K23)
          </p>
        </div>

        <div
          className="
            flex
            flex-col
            justify-end
            items-center
            lg:items-end
            text-center
            lg:text-right
            space-y-2
          "
        >
          <p className="text-slate-400">
            University Institute of Engineering &
            Technology (UIET), CSJMU Kanpur
          </p>

          <div
            className="
              flex
              flex-col
              sm:flex-row
              items-center
              gap-2
            "
          >
            <span
              className="
                px-3
                py-1
                rounded
                bg-amber-400/20
                border
                border-amber-400/30
                text-amber-300
                font-bold
                font-mono
                text-[10px]
              "
            >
              v3.0.0 Production Release
            </span>

            <span className="font-mono text-slate-400">
              2026
            </span>
          </div>
        </div>
      </div>

      {/* ==========================================================
          Copyright
      =========================================================== */}

      <div
        className="
          max-w-screen-2xl
          mx-auto
          mt-6
          pt-4
          border-t
          border-white/10
          flex
          flex-col
          md:flex-row
          items-center
          justify-between
          gap-3
          text-center
          md:text-left
          text-[11px]
          sm:text-xs
          text-slate-400
        "
      >
        <p>
          © 2026{' '}
          <strong>
            Chhatrapati Shahu Ji Maharaj University
            (CSJMU)
          </strong>{' '}
          & UIET Kanpur. All rights reserved.
        </p>

        <p className="font-semibold text-amber-300">
          Official Enterprise AI Campus Portal
        </p>
      </div>
    </footer>
  );
};