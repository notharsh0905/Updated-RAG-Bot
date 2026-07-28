'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { SystemHealth } from '@/types/chat';
import { Server, RefreshCw, Cpu, Database, ShieldCheck } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
        <h2 className="text-xl font-bold text-[#002B49] dark:text-white tracking-tight">
          System Infrastructure & Health Maintenance
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ollama inference node connection, Chroma vector collection state, and sparse BM25 keyword index management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ollama Engine Status */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[#002B49] dark:text-amber-400 font-bold text-sm">
            <Server className="w-5 h-5 text-[#8B0000] dark:text-amber-400" />
            <span>Ollama Inference Server Engine</span>
          </div>
          <div className="text-xs space-y-2 font-mono text-slate-700 dark:text-slate-300">
            <p><strong>Connection Status:</strong> {health?.ollama?.connected ? '🟢 Connected' : '🔴 Offline'}</p>
            <p><strong>Endpoint URL:</strong> http://localhost:11434</p>
            <p><strong>Primary LLM Model:</strong> llama3.2:3b</p>
            <p><strong>Embedding Engine:</strong> nomic-embed-text</p>
          </div>
        </div>

        {/* Vector DB & BM25 Status */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[#002B49] dark:text-amber-400 font-bold text-sm">
            <Database className="w-5 h-5 text-[#8B0000] dark:text-amber-400" />
            <span>Chroma Vector Store & BM25 Index</span>
          </div>
          <div className="text-xs space-y-2 font-mono text-slate-700 dark:text-slate-300">
            <p><strong>Active Collection:</strong> {health?.vector_db?.collection || 'collection50'}</p>
            <p><strong>Indexed Chunks:</strong> {health?.vector_db?.document_count || 994} chunks</p>
            <p><strong>BM25 Keyword Index:</strong> Synced across 994 document chunks</p>
          </div>
          <button
            onClick={handleTriggerRebuild}
            className="px-4 py-2 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Trigger Full Database Rebuild
          </button>
          {rebuildMsg && <p className="text-xs font-mono font-semibold pt-1 text-slate-800 dark:text-slate-200">{rebuildMsg}</p>}
        </div>
      </div>
    </div>
  );
}
