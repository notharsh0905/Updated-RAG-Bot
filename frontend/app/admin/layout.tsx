'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  MessageSquare,
  MessageSquareCode,
  CheckSquare,
  ShieldAlert,
  UploadCloud,
  Server,
  Users,
  Settings,
  UserCheck,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { apiService } from '@/services/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdminAuthenticated, setIsAdminAuthenticated } = useChatStore();
  const [openReviewsCount, setOpenReviewsCount] = useState<number>(0);

  const isLoginPage = pathname === '/admin/login';

  // Verify backend HttpOnly session cookie on admin page access
  useEffect(() => {
    if (isLoginPage) return;

    const verifySession = async () => {
      try {
        const res = await apiService.verifyAdminSession();
        if (res.authenticated) {
          setIsAdminAuthenticated(true);
        } else {
          setIsAdminAuthenticated(false);
          router.push('/admin/login');
        }
      } catch {
        setIsAdminAuthenticated(false);
        router.push('/admin/login');
      }
    };

    verifySession();
  }, [isLoginPage, pathname, router, setIsAdminAuthenticated]);

  // Synchronize open reviews badge count
  useEffect(() => {
    if (isLoginPage) return;
    const fetchBadgeCount = async () => {
      try {
        const items = await apiService.getQualityCenterItems();
        const openCount = items.filter((i) =>
          ['New', 'Assigned', 'Investigating', 'Waiting for KB Update'].includes(i.status)
        ).length;
        setOpenReviewsCount(openCount);
      } catch {
        setOpenReviewsCount(0);
      }
    };

    fetchBadgeCount();
    const interval = setInterval(fetchBadgeCount, 10000);
    return () => clearInterval(interval);
  }, [isLoginPage, pathname]);

  const handleLogout = async () => {
    try {
      await apiService.adminLogout();
    } catch (e) {
      console.error('Failed to log out admin session:', e);
    } finally {
      setIsAdminAuthenticated(false);
      router.push('/admin/login');
    }
  };

  const adminNav = [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    {
      href: '/admin/inquiries',
      label: 'Student Inquiries',
      icon: HelpCircle,
    },
    {
      href: '/admin/reviews',
      label: 'Human Review Workspace',
      icon: CheckSquare,
      badge: openReviewsCount > 0 ? openReviewsCount : undefined,
    },
    {
      href: '/admin/queries',
      label: 'Student Query Center',
      icon: MessageSquareCode,
    },
    {
      href: '/admin/monitoring',
      label: 'AI Quality Center',
      icon: ShieldAlert,
    },
    { href: '/admin/documents', label: 'Documents', icon: FileText },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/admin/knowledge', label: 'Knowledge Ingestion', icon: UploadCloud },
    { href: '/admin/system', label: 'System Health', icon: Server },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/profile', label: 'Admin Profile', icon: UserCheck },
  ];

  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Admin Header */}
      <div className="bg-[#002B49] text-white border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white p-0.5 border border-amber-400/40 shrink-0">
            <img
              src="/images/csjmu-seal-logo.jpg"
              alt="CSJMU Seal"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">
                CSJMU Administrative Console
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                Active Session
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              System performance monitoring, AI Quality Governance & knowledge base controls
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/80 hover:bg-red-800 text-white text-xs font-semibold border border-red-700/50 transition-colors shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin Mode</span>
        </button>
      </div>

      {/* Tabbed Admin Sub-Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 overflow-x-auto shadow-sm">
        <div className="flex items-center gap-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#8B0000] text-[#002B49] dark:text-amber-400 font-bold bg-slate-50 dark:bg-slate-800/60'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8B0000] dark:text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Container */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}
