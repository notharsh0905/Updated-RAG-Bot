'use client';

import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    topK: '5',
    similarityThreshold: '0.75',
    cacheTTLHours: '24',
    enableHybridBM25: true,
    strictNoHallucination: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
        <h2 className="text-xl font-bold text-[#002B49] dark:text-white tracking-tight">
          AI Model & Portal Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure Chroma RAG retrieval thresholds, semantic caching parameters, and response safety rules
        </p>
      </div>

      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-xs text-[#002B49] dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
              RAG Retrieval Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Vector Top-K Chunks Retrieved
                </label>
                <input
                  type="number"
                  value={config.topK}
                  onChange={(e) => setConfig({ ...config, topK: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cosine Similarity Cutoff (0.0 - 1.0)
                </label>
                <input
                  type="text"
                  value={config.similarityThreshold}
                  onChange={(e) => setConfig({ ...config, similarityThreshold: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={config.enableHybridBM25}
                  onChange={(e) => setConfig({ ...config, enableHybridBM25: e.target.checked })}
                  className="rounded border-slate-300 text-[#002B49] focus:ring-[#002B49]"
                />
                <span>Enable Hybrid BM25 Keyword Search Fusion</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={config.strictNoHallucination}
                  onChange={(e) => setConfig({ ...config, strictNoHallucination: e.target.checked })}
                  className="rounded border-slate-300 text-[#002B49] focus:ring-[#002B49]"
                />
                <span>Strict Academic Grounding (Refuse ungrounded queries)</span>
              </label>
            </div>
          </div>

          {saved && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Portal Configuration Saved Successfully</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full h-10 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration Settings</span>
          </button>
        </form>
      </div>
    </div>
  );
}
