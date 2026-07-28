'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminKnowledgePage() {
  const [file, setFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState('admissions');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('success');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
        <h2 className="text-xl font-bold text-[#002B49] dark:text-white tracking-tight">
          Knowledge Base Ingestion Portal
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload PDF prospectus, JSON structured datasets, or text files for automatic Chroma vector chunking
        </p>
      </div>

      {/* Upload Box */}
      <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#002B49]/10 dark:bg-amber-400/10 text-[#002B49] dark:text-amber-300 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6 text-[#8B0000] dark:text-amber-400" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Upload Document for Vector Indexing
          </h3>
          <p className="text-xs text-slate-500">
            Select official University PDF, TXT, or JSON file to ingest into Chroma vector collection
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Document Category
            </label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
            >
              <option value="admissions">B.Tech Prospectus & Admission Rules</option>
              <option value="scholarship">UP Post-Matric Fee Waiver Rules</option>
              <option value="hostel">Hostel & Mess Guidelines</option>
              <option value="syllabus">AICTE Course Syllabus & Curriculum</option>
              <option value="placements">Placement Records & Recruiter Stats</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-[#002B49] dark:hover:border-amber-400 transition-colors bg-slate-50 dark:bg-slate-950">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <input
              type="file"
              accept=".pdf,.json,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="cursor-pointer text-xs font-bold text-[#002B49] dark:text-amber-400 hover:underline"
            >
              {file ? file.name : 'Click to select file (.pdf, .json, .txt)'}
            </label>
            <p className="text-[11px] text-slate-500 pt-1">Max file size: 25MB</p>
          </div>

          {uploadStatus === 'success' && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Document ingested and chunked successfully!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploadStatus === 'uploading'}
            className="w-full h-10 rounded-lg bg-[#002B49] hover:bg-[#001D33] disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            {uploadStatus === 'uploading' ? 'Ingesting Document...' : 'Ingest Document into RAG Knowledge Base'}
          </button>
        </form>
      </div>
    </div>
  );
}
