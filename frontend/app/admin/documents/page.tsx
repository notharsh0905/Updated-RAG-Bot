'use client';

import React from 'react';
import Link from 'next/link';
import { useChatStore } from '@/store/useChatStore';
import { FileText, ArrowLeft, Database } from 'lucide-react';

export default function AdminDocumentsPage() {
  const { messages } = useChatStore();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            📚 Document Reference Inspector
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administrative inspection tool for retrieved document chunks & sources
          </p>
        </div>
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-csjmu-blue hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="space-y-4">
        {messages.filter(m => m.sources && m.sources.length > 0).map((msg, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-csjmu-navy dark:text-csjmu-gold">
              <Database className="w-4 h-4" />
              <span>Query Match Sources ({msg.timestamp}):</span>
            </div>
            <div className="space-y-2">
              {msg.sources?.map((src, sIdx) => (
                <div key={sIdx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs space-y-1 font-mono">
                  <p><strong>File:</strong> `{src.source}` | <strong>Category:</strong> `{src.doc_type}`</p>
                  <p className="text-slate-600 dark:text-slate-300 font-sans italic">&quot;{src.content_snippet}...&quot;</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {messages.filter(m => m.sources && m.sources.length > 0).length === 0 && (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 text-center text-xs text-slate-400 border border-slate-200 dark:border-slate-700">
            No query document matches logged in the current active session.
          </div>
        )}
      </div>
    </div>
  );
}
