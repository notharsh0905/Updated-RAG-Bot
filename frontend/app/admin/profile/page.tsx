'use client';

import React from 'react';
import { UserCheck, ShieldCheck, Key, Lock, CheckCircle2 } from 'lucide-react';

export default function AdminProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
        <h2 className="text-xl font-bold text-[#002B49] dark:text-white tracking-tight">
          Administrator Account Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Official CSJMU institutional credentials and active session security status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-center md:col-span-1">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 mx-auto bg-white p-0.5">
            <img
              src="/images/csjmu-seal-logo.jpg"
              alt="CSJMU Seal"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#002B49] dark:text-white">CSJMU System Administrator</h3>
            <p className="text-xs text-slate-500 font-mono">admin@csjmu.ac.in</p>
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold">
            Super Administrator
          </span>
        </div>

        {/* Security & Activity Status */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 md:col-span-2">
          <h3 className="font-bold text-xs text-[#002B49] dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
            Active Security Audit Log
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-slate-800 dark:text-slate-200">2FA Authentication Status</span>
              </div>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Verified Active</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#002B49] dark:text-[#1E88FF]" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Session Encryption</span>
              </div>
              <span className="font-mono text-slate-600 dark:text-slate-400">TLS 1.3 / AES-256</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#1268D4] dark:text-[#1E88FF]" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Passcode Key Status</span>
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Authorized Key</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
