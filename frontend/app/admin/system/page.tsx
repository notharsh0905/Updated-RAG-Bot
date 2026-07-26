'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import { SystemHealth } from '@/types/chat';
import { Server, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AdminSystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [rebuildMsg, setRebuildMsg] = useState('');

  useEffect(() => {
    apiService.getHealth().then(setHealth).catch(() => {});
  }, []);

  const handleTriggerRebuild = async () => {
    try {
      setRebuildMsg('Rebuilding Vector Store & BM25 index...');
      const res = await apiService.triggerRebuild();
      setRebuildMsg(`✅ ${res.message} (${res.document_count} documents)`);
    } catch (e) {
      setRebuildMsg('❌ Database rebuild failed.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            🛠️ System Health & Maintenance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hardware status, Ollama model connections, Chroma DB collection state
          </p>
        </div>
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-csjmu-blue hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-csjmu-navy dark:text-csjmu-gold font-bold text-sm">
            <Server className="w-5 h-5" />
            <span>Ollama Inference Server</span>
          </div>
          <div className="text-xs space-y-1 font-mono text-slate-600 dark:text-slate-300">
            <p><strong>Status:</strong> {health?.ollama?.connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
            <p><strong>URL:</strong> http://localhost:11434</p>
            <p><strong>LLM Model:</strong> llama3.2:3b</p>
            <p><strong>Embedding Model:</strong> nomic-embed-text</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-csjmu-navy dark:text-csjmu-gold font-bold text-sm">
            <RefreshCw className="w-5 h-5" />
            <span>Vector Database (Chroma)</span>
          </div>
          <div className="text-xs space-y-1 font-mono text-slate-600 dark:text-slate-300">
            <p><strong>Active Collection:</strong> {health?.vector_db?.collection || 'collection50'}</p>
            <p><strong>Indexed Chunks:</strong> {health?.vector_db?.document_count || 994}</p>
            <p><strong>Sparse BM25 Index:</strong> Built across 994 document chunks</p>
          </div>
          <button
            onClick={handleTriggerRebuild}
            className="px-4 py-2 rounded-xl bg-csjmu-blue hover:bg-csjmu-navy text-white text-xs font-bold transition-all shadow-sm"
          >
            Trigger Full Database Rebuild
          </button>
          {rebuildMsg && <p className="text-xs font-mono font-semibold pt-1">{rebuildMsg}</p>}
        </div>
      </div>
    </div>
  );
}
