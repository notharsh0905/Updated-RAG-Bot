'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, KeyRound } from 'lucide-react';
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
      setError('Invalid Passcode. Please enter authorized university administrator key.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-csjmu-navy text-csjmu-gold flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            University Admin Login
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authorized access for CSJMU Knowledge Management & Analytics
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Admin Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="Enter passcode (e.g. csjmu2026)..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-csjmu-blue"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-csjmu-blue hover:bg-csjmu-navy text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Authenticate Admin Access
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure University Credentials Required</span>
        </div>
      </div>
    </div>
  );
}
