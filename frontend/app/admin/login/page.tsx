'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useChatStore } from '@/store/useChatStore';

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const { setIsAdminAuthenticated } = useChatStore();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (['csjmu2026', 'admin123'].includes(passcode.trim())) {
      setIsAdminAuthenticated(true);
      router.push('/admin/dashboard');
    } else {
      setError('Invalid Administrator Key. Enter authorized university passcode (e.g., csjmu2026).');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
        
        {/* CSJMU Official Logo & Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm mx-auto bg-white p-0.5">
            <img
              src="/images/csjmu-seal-logo.jpg"
              alt="CSJMU Official Seal Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-serif font-bold text-[#002B49] dark:text-white tracking-tight">
              CSJMU University Admin Console
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authorized personnel access for UIET AI knowledge base & metrics
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Administrator Passcode *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="Enter passcode (e.g. csjmu2026)..."
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400 font-mono"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white font-semibold text-xs shadow-sm transition-colors"
          >
            Authenticate Admin Credentials
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-bit Encrypted Session</span>
          </div>
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Public Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
