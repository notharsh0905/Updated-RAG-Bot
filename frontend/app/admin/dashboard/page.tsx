'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import { apiService } from '@/services/api';
import { AnalyticsSummary, SystemHealth } from '@/types/chat';
import { Activity, Database, FileText, ThumbsUp, RefreshCw, LogOut, CheckCircle, Server } from 'lucide-react';

export default function AdminDashboardPage() {
  const { isAdminAuthenticated, setIsAdminAuthenticated } = useChatStore();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [rebuildMsg, setRebuildMsg] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.push('/admin/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [aData, hData] = await Promise.all([
          apiService.getAdminAnalytics(),
          apiService.getHealth(),
        ]);
        setAnalytics(aData);
        setHealth(hData);
      } catch (e) {
        // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdminAuthenticated, router]);

  const handleRebuild = async () => {
    try {
      setRebuildMsg('Rebuilding Vector Store & BM25 index...');
      const res = await apiService.triggerRebuild();
      setRebuildMsg(`✅ ${res.message} (${res.document_count} documents)`);
    } catch (e) {
      setRebuildMsg('❌ Database rebuild failed.');
    }
  };

  if (!isAdminAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            🔐 University Administrative Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            System performance monitoring, database rebuilding, knowledge management & analytics
          </p>
        </div>

        <button
          onClick={() => {
            setIsAdminAuthenticated(false);
            router.push('/');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all w-fit"
        >
          <LogOut className="w-4 h-4" />
          Log Out Admin
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Link href="/admin/dashboard" className="px-4 py-2 rounded-xl bg-csjmu-navy text-csjmu-gold text-xs font-bold shadow-sm">
          📊 Overview & Metrics
        </Link>
        <Link href="/admin/documents" className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          📚 Document Inspector
        </Link>
        <Link href="/admin/feedback" className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          📝 Feedback Summary
        </Link>
        <Link href="/admin/system" className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold">
          🛠️ System Health & Maintenance
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Total Queries Logged</span>
            <Activity className="w-5 h-5 text-csjmu-blue" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? analytics.total_queries : 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Avg Response Time</span>
            <Server className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? `${analytics.avg_response_time_sec}s` : '0.0s'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Cache Hits</span>
            <Database className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? analytics.cache_hits : 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">User Satisfaction</span>
            <ThumbsUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? `${analytics.satisfaction_pct}%` : '100%'}
          </div>
        </div>
      </div>

      {/* Database Maintenance & Server Health Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-csjmu-gold" />
            Vector Database & BM25 Maintenance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rebuild Chroma vector collection (collection50) and BM25 sparse keyword index across 994 document chunks.
          </p>

          {rebuildMsg && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-mono font-semibold">
              {rebuildMsg}
            </div>
          )}

          <button
            onClick={handleRebuild}
            className="px-5 py-2.5 rounded-xl bg-csjmu-blue hover:bg-csjmu-navy text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            🔄 Trigger Full Database Rebuild
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Server & Index Health
          </h3>
          <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 font-mono">
            <p><strong>Ollama Status:</strong> {health?.ollama?.connected ? '🟢 Online' : '🔴 Offline'}</p>
            <p><strong>Vector Collection:</strong> {health?.vector_db?.collection || 'collection50'}</p>
            <p><strong>Indexed Documents:</strong> {health?.vector_db?.document_count || 994} chunks</p>
            <p><strong>Dataset Status:</strong> {health?.dataset?.exists ? '🟢 Active Documents Present' : '🔴 Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
