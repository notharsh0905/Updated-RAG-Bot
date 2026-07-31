'use client';

import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  Layers,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { apiService } from '@/services/api';

interface UploadResult {
  success: boolean;
  document_id: string;
  filename: string;
  pages: number;
  chunks: number;
  embedding_model: string;
  processing_time: number;
  status: string;
}

interface UploadedDocumentItem {
  document_id: string;
  original_filename: string;
  stored_filename: string;
  file_type: string;
  file_size_bytes: number;
  checksum: string;
  category?: string;
  page_count: number;
  chunk_count: number;
  status: string;
  upload_timestamp: string;
}

export default function AdminKnowledgePage() {
  const [file, setFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState('admissions');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [lastResult, setLastResult] = useState<UploadResult | null>(null);

  // Knowledge Library State
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);

  const fetchLibrary = async () => {
    setLoadingDocs(true);
    try {
      const docs = await apiService.getUploadedDocuments();
      setUploadedDocs(docs);
    } catch {
      setUploadedDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploadStatus('processing');
    setErrorMsg('');
    setLastResult(null);
    setProgressPercent(15);
    setCurrentStep('Uploading...');

    // Progress step animation simulation during network/embedding execution
    const t1 = setTimeout(() => {
      setProgressPercent(35);
      setCurrentStep('Extracting...');
    }, 600);

    const t2 = setTimeout(() => {
      setProgressPercent(55);
      setCurrentStep('Chunking...');
    }, 1200);

    const t3 = setTimeout(() => {
      setProgressPercent(75);
      setCurrentStep('Embedding...');
    }, 2000);

    const t4 = setTimeout(() => {
      setProgressPercent(90);
      setCurrentStep('Updating Knowledge Base...');
    }, 3200);

    try {
      const result = await apiService.uploadDocument(file, docCategory);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      setProgressPercent(100);
      setCurrentStep('Completed');
      setUploadStatus('success');
      setLastResult(result);
      setFile(null);

      // Refresh Knowledge Library immediately without page reload
      fetchLibrary();
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      setUploadStatus('error');
      setProgressPercent(0);
      setCurrentStep('');

      const detail =
        err?.response?.data?.detail || err?.message || 'Ingestion failed. Ensure server is running.';
      setErrorMsg(detail);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <h2 className="text-xl font-bold text-[#002B49] dark:text-white tracking-tight font-serif">
          Knowledge Base Ingestion Portal
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload PDF prospectus, DOCX guidelines, JSON structured datasets, or text files for automatic Chroma vector embedding
        </p>
      </div>

      {/* Upload Box */}
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#002B49]/10 dark:bg-amber-400/10 text-[#002B49] dark:text-amber-300 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6 text-[#8B0000] dark:text-amber-400" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Upload Document for Vector Indexing
          </h3>
          <p className="text-xs text-slate-500">
            Select official PDF, TXT, DOCX, or JSON file to ingest directly into Chroma vector collection
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Document Category / Domain Tag
            </label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              disabled={uploadStatus === 'processing'}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400 font-medium"
            >
              <option value="admissions">B.Tech Prospectus & Admission Rules</option>
              <option value="scholarship">UP Post-Matric Fee Waiver Rules</option>
              <option value="hostel">Hostel & Mess Guidelines</option>
              <option value="syllabus">AICTE Course Syllabus & Curriculum</option>
              <option value="placements">Placement Records & Recruiter Stats</option>
              <option value="general_info">General University Regulations</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-[#002B49] dark:hover:border-amber-400 transition-colors bg-slate-50 dark:bg-slate-950">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <input
              type="file"
              accept=".pdf,.json,.txt,.docx"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setErrorMsg('');
                setUploadStatus('idle');
              }}
              disabled={uploadStatus === 'processing'}
              className="hidden"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="cursor-pointer text-xs font-bold text-[#002B49] dark:text-amber-400 hover:underline block"
            >
              {file ? file.name : 'Click to select file (.pdf, .txt, .docx, .json)'}
            </label>
            <p className="text-[11px] text-slate-500 pt-1">Maximum file size: 50MB</p>
          </div>

          {/* Progress Indicator */}
          {uploadStatus === 'processing' && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  {currentStep}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                <div
                  className="h-full bg-[#002B49] dark:bg-amber-400 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Banner & Diagnostic Summary */}
          {uploadStatus === 'success' && lastResult && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Document Ingested & Embedded Successfully!</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
                <div>
                  <span className="text-slate-500 block">Pages:</span>
                  <strong className="text-slate-900 dark:text-white">{lastResult.pages}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Chunks:</span>
                  <strong className="text-slate-900 dark:text-white">{lastResult.chunks}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Model:</span>
                  <strong className="text-slate-900 dark:text-white">{lastResult.embedding_model}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Time:</span>
                  <strong className="text-slate-900 dark:text-white">{lastResult.processing_time}s</strong>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {uploadStatus === 'error' && errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <strong>Ingestion Error:</strong> {errorMsg}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploadStatus === 'processing'}
            className="w-full h-10 rounded-xl bg-[#002B49] hover:bg-[#001D33] disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-all active:scale-98"
          >
            {uploadStatus === 'processing'
              ? `${currentStep} (${progressPercent}%)`
              : 'Ingest Document into RAG Knowledge Base'}
          </button>
        </form>
      </div>

      {/* Real-time Knowledge Library Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#8B0000] dark:text-amber-400" />
            <h3 className="font-bold text-sm text-[#002B49] dark:text-white">
              Indexed Knowledge Library ({uploadedDocs.length})
            </h3>
          </div>

          <button
            onClick={fetchLibrary}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDocs ? 'animate-spin' : ''}`} />
            <span>Refresh Library</span>
          </button>
        </div>

        {uploadedDocs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs space-y-1">
            <Layers className="w-6 h-6 mx-auto text-slate-400" />
            <p className="font-semibold">No uploaded documents present in Knowledge Library.</p>
            <p className="text-[11px] text-slate-400">
              Upload PDF, TXT, DOCX, or JSON files above to index them into the vector database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Document Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">File Size</th>
                  <th className="py-2.5 px-3">Pages / Chunks</th>
                  <th className="py-2.5 px-3">Upload Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-800 dark:text-slate-200">
                {uploadedDocs.map((doc) => (
                  <tr key={doc.document_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white font-sans flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {doc.original_filename}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{doc.document_id}</div>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold uppercase">
                        {doc.category || 'Uploaded'}
                      </span>
                    </td>
                    <td className="py-3 px-3">{formatBytes(doc.file_size_bytes)}</td>
                    <td className="py-3 px-3 font-semibold">
                      {doc.page_count} pg / <span className="text-blue-600 dark:text-amber-400">{doc.chunk_count} chunks</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{doc.upload_timestamp}</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Indexed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

