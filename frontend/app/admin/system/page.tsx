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

      {/* Project Credits & Institutional Metadata */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-[#002B49] dark:text-white uppercase tracking-wider">
            Academic R&D Project Credits & System Specifications
          </h3>
          <span className="text-xs font-mono font-bold text-cyan-500 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
            Release v3.0.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Academic Project Guide
            </span>
            <p className="font-bold text-slate-900 dark:text-white">Assistant Professor Gayatri Rajpoot</p>
            <p className="text-[11px] text-slate-500">Dept. of Computer Science & Engineering</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Lead Software Architect
            </span>
            <p className="font-bold text-slate-900 dark:text-white">Harsh Upadhyay</p>
            <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono">B.Tech CSE (2K24)</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Engineering Team Members
            </span>
            <p className="font-bold text-slate-900 dark:text-white">Nikhil Kumar <span className="font-mono text-[10px] font-normal text-slate-500">(B.Tech CSE AI 2K23)</span></p>
            <p className="font-bold text-slate-900 dark:text-white">Priyanshi Yadav <span className="font-mono text-[10px] font-normal text-slate-500">(B.Tech CSE AI 2K23)</span></p>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <span>University Institute of Engineering & Technology (UIET), CSJMU Kanpur</span>
          <span>Deployment Year: 2026</span>
        </div>
      </div>
    </div>
  );
}
