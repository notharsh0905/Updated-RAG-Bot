'use client';

import React from 'react';
import Link from 'next/link';
import { Upload, ArrowLeft } from 'lucide-react';

export default function AdminKnowledgePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            📥 Knowledge Base Ingestion
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload new PDF, TXT, or JSON university documents for vector indexing
          </p>
        </div>
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-csjmu-blue hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-csjmu-navy/10 dark:bg-csjmu-blue/30 text-csjmu-navy dark:text-csjmu-gold flex items-center justify-center mx-auto">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Upload New Document File</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload PDF prospectus or JSON structured data directly into the raw documents repository for ingestion.
        </p>

        <input
          type="file"
          accept=".pdf,.json,.txt"
          className="mx-auto block text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-csjmu-blue file:text-white hover:file:bg-csjmu-navy"
        />
      </div>
    </div>
  );
}
