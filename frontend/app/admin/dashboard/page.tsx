'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import { apiService } from '@/services/api';
import { AnalyticsSummary, SystemHealth } from '@/types/chat';
import {
  Activity,
  Database,
  ThumbsUp,
  RefreshCw,
  CheckCircle2,
  Server,
  FileText,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { isAdminAuthenticated } = useChatStore();
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
          apiService.getAdminAnalytics().catch(() => null),
          apiService.getHealth().catch(() => null),
        ]);
        setAnalytics(aData);
        setHealth(hData);
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
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#002B49] dark:text-white tracking-tight">
            System Performance & Executive Metrics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time analytics for RAG document retrieval, Ollama model latency, and vector database status
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Chroma DB {health?.vector_db?.collection || 'collection50'} Active</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Queries Logged</span>
            <Activity className="w-4 h-4 text-[#002B49] dark:text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? analytics.total_queries : 0}
          </div>
          <p className="text-[11px] text-slate-500">Processed by AI RAG Pipeline</p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Response Time</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? `${analytics.avg_response_time_sec}s` : '0.0s'}
          </div>
          <p className="text-[11px] text-slate-500">LLM Generation Latency</p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Cache Hits</span>
            <Database className="w-4 h-4 text-[#8B0000] dark:text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? analytics.cache_hits : 0}
          </div>
          <p className="text-[11px] text-slate-500">Fast Semantic Cache Ratio</p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">User Satisfaction</span>
            <ThumbsUp className="w-4 h-4 text-[#002B49] dark:text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {analytics ? `${analytics.satisfaction_pct}%` : '100%'}
          </div>
          <p className="text-[11px] text-slate-500">Positive Feedback Ratio</p>
        </div>
      </div>

      {/* Database Maintenance & Server Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-[#002B49] dark:text-white flex items-center gap-2 uppercase tracking-wide">
            <RefreshCw className="w-4 h-4 text-[#8B0000] dark:text-amber-400" />
            <span>Vector DB & BM25 Rebuild</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Rebuild Chroma vector collection and BM25 sparse keyword index across all document chunks in the repository.
          </p>

          {rebuildMsg && (
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
              {rebuildMsg}
            </div>
          )}

          <button
            onClick={handleRebuild}
            className="px-4 py-2 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Trigger Full Database Rebuild
          </button>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <h3 className="font-bold text-sm text-[#002B49] dark:text-white flex items-center gap-2 uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>System Infrastructure Health</span>
          </h3>
          <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300 font-mono">
            <p><strong>LLM Engine:</strong> {health?.llm?.provider || 'OpenRouter'} ({health?.llm?.connected ? '🟢 Online' : '🔴 Offline'})</p>
            <p><strong>Embedding Engine:</strong> {health?.embeddings?.provider || 'Ollama'} ({health?.embeddings?.connected ? '🟢 Active' : '🔴 Offline'})</p>
            <p><strong>Vector Collection:</strong> {health?.vector_db?.collection || 'collection50'}</p>
            <p><strong>Indexed Chunks:</strong> {health?.vector_db?.document_count || 0} chunks</p>
            <p><strong>Dataset Repository:</strong> {health?.dataset?.exists ? '🟢 Active Documents Present' : '🔴 Missing'}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
