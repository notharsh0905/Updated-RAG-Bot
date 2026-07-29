'use client';

import React from 'react';
import { useConversationStore } from '@/store/useConversationStore';
import { FileText, Database } from 'lucide-react';

export default function AdminDocumentsPage() {
  const { getActiveMessages } = useConversationStore();
  const messages = getActiveMessages();
  const sourceMessages = messages.filter((m) => m.sources && m.sources.length > 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
        <h2 className="text-xl font-bold text-[#002B49] dark:text-white tracking-tight">
          Document Reference Inspector
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Inspection tool for retrieved vector chunks, document sources, and knowledge base origin
        </p>
      </div>

      {/* RAG Source Log Table */}
      <div className="space-y-4">
        {sourceMessages.map((msg, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#002B49] dark:text-amber-400">
                <Database className="w-4 h-4" />
                <span>Query Document Match Log ({msg.timestamp}):</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Session Match</span>
            </div>

            <div className="space-y-2">
              {msg.sources?.map((src, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-mono"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-800 dark:text-slate-200">
                    <p>
                      <strong>Origin Source File:</strong> `{src.source}`
                    </p>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      Doc Type: {src.doc_type}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-sans italic pt-1 leading-relaxed">
                    &quot;{src.content_snippet}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {sourceMessages.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Query References Logged Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ask questions on the AI assistant interface to inspect retrieved Chroma vector chunks and source documents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
