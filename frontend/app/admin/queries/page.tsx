'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  MessageSquareCode,
  Clock,
  Cpu,
  Layers,
  Star,
  Pin,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  Bookmark,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Copy,
  Check,
  Send,
  Database,
  Tag,
  Zap,
  Terminal,
  Activity,
  Sliders,
  FileCheck,
  Award,
  BarChart2,
  GitCommit,
  CheckSquare,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { SystemHealth } from '@/types/chat';
import { safeCopyToClipboard } from '@/utils/generateId';

// Types for AI Operations Trace Item
interface QueryTraceItem {
  query_id: string;
  session_id: string;
  question: string;
  answer: string;
  confidence_score?: number;
  response_time_sec?: number;
  total_retrieved_chunks?: number;
  cached?: boolean;
  timestamp: string;
  user_rating?: number;
  user_comments?: string;
  ticket_id?: string;
  review_status?: string;
  priority?: string;
  assigned_reviewer?: string;
  root_cause?: string;
  is_pinned?: boolean;
  department_category?: string;
}

export default function StudentQueryCenterPage() {
  const [queries, setQueries] = useState<QueryTraceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePreset, setActivePreset] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Inspector States
  const [selectedQuery, setSelectedQuery] = useState<QueryTraceItem | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<
    'overview' | 'retrieval' | 'prompt' | 'generation' | 'documents' | 'explanation' | 'governance'
  >('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedChunkId, setExpandedChunkId] = useState<string | null>('chunk-1');

  // Review Form States inside Inspector
  const [ticketStatus, setTicketStatus] = useState<string>('Pending');
  const [ticketPriority, setTicketPriority] = useState<string>('Medium');
  const [ticketRootCause, setTicketRootCause] = useState<string>('Unknown');
  const [ticketReviewer, setTicketReviewer] = useState<string>('Unassigned');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSavedNotes, setIsSavedNotes] = useState<boolean>(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  // Load Feed Data from API
  const fetchQueries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getQueryFeed({ limit: 100 });
      if (data && data.length > 0) {
        setQueries(data);
        if (!selectedQuery) {
          setSelectedQuery(data[0]);
        }
      } else {
        // Fallback trace data if database is empty
        const fallback: QueryTraceItem[] = [
          {
            query_id: 'query_05a1bd16-9cba-4a9f-832a-df9daf89b0c2',
            session_id: 'session-btech-uiet-8821',
            question: 'What is the minimum eligibility percentage for B.Tech CSE at UIET Kanpur?',
            answer:
              'The minimum eligibility for B.Tech Computer Science & Engineering (CSE) at UIET Kanpur is 45% aggregate in 10+2 with Physics, Mathematics, and Chemistry/Computer Science for General category (40% for SC/ST). Admission is granted based on JEE Main scores via UPTAC counseling.',
            confidence_score: 0.93,
            response_time_sec: 0.44,
            total_retrieved_chunks: 3,
            cached: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            user_rating: 1,
            department_category: 'admissions',
          },
          {
            query_id: 'query_8f9b2c1a-4d3e-4b2a-8c1d-9e8f7a6b5c4d',
            session_id: 'session-hostel-9912',
            question: 'What is the exact hostel fee for 1st year B.Tech girls at UIET Kanpur?',
            answer:
              'The hostel fee for B.Tech students is Rs. 48,500 per annum including mess advance and security deposit as per official CSJMU Hostel Circular 2026-27.',
            confidence_score: 0.91,
            response_time_sec: 0.48,
            total_retrieved_chunks: 3,
            cached: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            user_rating: 1,
            user_comments: 'Clear hostel fee breakdown provided.',
            ticket_id: 'tkt_74dd8a5a',
            review_status: 'Resolved',
            priority: 'Medium',
            root_cause: 'None',
            assigned_reviewer: 'Hostel Office',
            department_category: 'hostels',
          },
          {
            query_id: 'query_731d223c-c0b9-485a-a098-7c7ef69eeebd',
            session_id: 'session-gate-stipend-1209',
            question: 'Are GATE qualified M.Tech students eligible for AICTE stipends at CSJMU?',
            answer:
              'Yes, GATE qualified M.Tech students admitted through regular university counseling may receive a monthly AICTE stipend of around ₹12,400 per month (varies according to current AICTE guidelines and eligibility) via direct bank transfer.',
            confidence_score: 0.96,
            response_time_sec: 0.31,
            total_retrieved_chunks: 4,
            cached: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            user_rating: 1,
            department_category: 'scholarship',
          },
          {
            query_id: 'query_99e8a71b-3c2d-4e5f-8a1b-2c3d4e5f6a7b',
            session_id: 'session-migration-4410',
            question: 'How do I apply for an official Migration Certificate or Character Certificate online?',
            answer:
              'Students can apply for an official Migration Certificate by logging into the CSJMU Student Portal (csjmu.ac.in), submitting the online application form, uploading final marksheets, and paying the nominal fee of Rs. 300.',
            confidence_score: 0.94,
            response_time_sec: 0.38,
            total_retrieved_chunks: 3,
            cached: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            user_rating: 1,
            department_category: 'academics',
          },
        ];
        setQueries(fallback);
        setSelectedQuery(fallback[0]);
      }
    } catch {
      setError('Failed to connect to backend server. Displaying trace feed data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
    apiService.getHealth().then(setHealth).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedQuery) {
      setTicketStatus(selectedQuery.review_status || 'Pending');
      setTicketPriority(selectedQuery.priority || 'Medium');
      setTicketRootCause(selectedQuery.root_cause || 'Unknown');
      setTicketReviewer(selectedQuery.assigned_reviewer || 'Unassigned');
      setAdminNotes(selectedQuery.user_comments ? `Student Feedback: ${selectedQuery.user_comments}` : '');
    }
  }, [selectedQuery]);

  // AI Health Computations
  const getAIHealth = (item: QueryTraceItem) => {
    if (item.user_rating === -1) {
      return { label: 'Needs Review', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800', icon: XCircle };
    }
    const score = item.confidence_score || 0.8;
    if (score >= 0.9) return { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 };
    if (score >= 0.75) return { label: 'Good', color: 'text-blue-600 dark:text-cyan-400', bg: 'bg-blue-50 dark:bg-cyan-950/40 border-blue-200 dark:border-cyan-800', icon: Sparkles };
    return { label: 'Low Confidence', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', icon: AlertTriangle };
  };

  // Presets Count Breakdown
  const presetCounts = useMemo(() => {
    return {
      all: queries.length,
      needsReview: queries.filter((q) => q.user_rating === -1 || (q.confidence_score && q.confidence_score < 0.75)).length,
      negative: queries.filter((q) => q.user_rating === -1).length,
      lowConfidence: queries.filter((q) => q.confidence_score && q.confidence_score < 0.7).length,
      pinned: queries.filter((q) => pinnedIds.has(q.query_id)).length,
    };
  }, [queries, pinnedIds]);

  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const matchesQ = q.question.toLowerCase().includes(queryLower);
        const matchesA = q.answer.toLowerCase().includes(queryLower);
        const matchesID = q.session_id.toLowerCase().includes(queryLower) || q.query_id.toLowerCase().includes(queryLower);
        if (!matchesQ && !matchesA && !matchesID) return false;
      }

      if (activePreset === 'needsReview') {
        if (q.user_rating !== -1 && (!q.confidence_score || q.confidence_score >= 0.75)) return false;
      } else if (activePreset === 'negative') {
        if (q.user_rating !== -1) return false;
      } else if (activePreset === 'lowConfidence') {
        if (!q.confidence_score || q.confidence_score >= 0.7) return false;
      } else if (activePreset === 'pinned') {
        if (!pinnedIds.has(q.query_id)) return false;
      }

      if (statusFilter !== 'all' && q.review_status !== statusFilter) return false;
      if (ratingFilter === 'positive' && q.user_rating !== 1) return false;
      if (ratingFilter === 'negative' && q.user_rating !== -1) return false;
      if (departmentFilter !== 'all' && q.department_category !== departmentFilter) return false;

      if (confidenceFilter === 'high' && (!q.confidence_score || q.confidence_score < 0.9)) return false;
      if (confidenceFilter === 'medium' && (!q.confidence_score || q.confidence_score < 0.75 || q.confidence_score >= 0.9)) return false;
      if (confidenceFilter === 'low' && (!q.confidence_score || q.confidence_score >= 0.75)) return false;

      return true;
    });
  }, [queries, searchQuery, activePreset, statusFilter, ratingFilter, confidenceFilter, departmentFilter, pinnedIds]);

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    safeCopyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNotes = () => {
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* ========================================================================= */}
      {/* TOP TOOLBAR */}
      {/* ========================================================================= */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-cyan-500/10 text-[#002B49] dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Student Query Center
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20 font-mono">
                Deep RAG Explorer
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              LangSmith-style pipeline trace inspection, vector similarity scores, and grounding analytics
            </p>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search traces or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400 transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="hidden sm:block bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Resolved">Resolved</option>
            <option value="Escalated">Escalated</option>
          </select>

          <button
            onClick={fetchQueries}
            disabled={loading}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-300 dark:border-slate-700 disabled:opacity-50"
            title="Refresh Traces"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              const jsonStr = JSON.stringify(filteredQueries, null, 2);
              const blob = new Blob([jsonStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `rag_trace_export_${Date.now()}.json`;
              a.click();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#002B49] hover:bg-[#001D33] text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3-PANEL RESPONSIVE CONTAINER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: LEFT SIDEBAR (~320px) */}
        <aside className="w-80 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 space-y-6 overflow-y-auto">
            <div>
              <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
                Saved Presets
              </h2>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Traces', count: presetCounts.all, icon: Layers },
                  { id: 'needsReview', label: 'Needs Review', count: presetCounts.needsReview, icon: AlertTriangle, badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' },
                  { id: 'negative', label: 'Negative Feedback', count: presetCounts.negative, icon: XCircle, badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400' },
                  { id: 'lowConfidence', label: 'Low Confidence (<70%)', count: presetCounts.lowConfidence, icon: ShieldAlert, badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400' },
                  { id: 'pinned', label: 'Pinned Traces', count: presetCounts.pinned, icon: Pin, badgeColor: 'bg-blue-100 text-blue-800 dark:bg-cyan-500/20 dark:text-cyan-400' },
                ].map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activePreset === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePreset(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-[#002B49] dark:text-cyan-400 border border-blue-200 dark:border-blue-800'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#002B49] dark:text-cyan-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
              <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
                Filter Matrix
              </h2>

              <div className="space-y-1.5 px-2">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Student Feedback</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                >
                  <option value="all">All Feedback</option>
                  <option value="positive">👍 Positive Only</option>
                  <option value="negative">👎 Negative Only</option>
                </select>
              </div>

              <div className="space-y-1.5 px-2">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Vector Confidence</label>
                <select
                  value={confidenceFilter}
                  onChange={(e) => setConfidenceFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                >
                  <option value="all">All Confidence Scores</option>
                  <option value="high">High (≥ 90%)</option>
                  <option value="medium">Medium (75% - 89%)</option>
                  <option value="low">Low (&lt; 75%)</option>
                </select>
              </div>

              <div className="space-y-1.5 px-2">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Department Domain</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                >
                  <option value="all">All Departments</option>
                  <option value="admissions">Admissions & Eligibility</option>
                  <option value="hostels">Hostels & Accommodation</option>
                  <option value="scholarship">Scholarships & Grants</option>
                  <option value="academics">Academics & Syllabus</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* PANEL 2: CENTER QUERY CARD FEED PANEL */}
        <main className="flex-1 border-r border-slate-200 dark:border-slate-800 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
          <div className="px-4 py-3 bg-white/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing <strong className="text-slate-900 dark:text-slate-200">{filteredQueries.length}</strong> of{' '}
              <strong className="text-slate-900 dark:text-slate-200">{queries.length}</strong> query traces
            </span>

            {(searchQuery || activePreset !== 'all' || statusFilter !== 'all' || ratingFilter !== 'all' || confidenceFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActivePreset('all');
                  setStatusFilter('all');
                  setRatingFilter('all');
                  setConfidenceFilter('all');
                  setDepartmentFilter('all');
                }}
                className="text-xs text-[#002B49] dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 animate-pulse shadow-xs">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))
            ) : filteredQueries.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm my-6">
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 text-[#002B49] dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20 mb-3">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">No Query Traces Found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                  No student interactions matched your active search query or filter matrix parameters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActivePreset('all');
                    setStatusFilter('all');
                    setRatingFilter('all');
                    setConfidenceFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-[#002B49] hover:bg-[#001D33] text-white rounded-xl text-xs font-medium transition-colors shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredQueries.map((item) => {
                const health = getAIHealth(item);
                const HealthIcon = health.icon;
                const isSelected = selectedQuery?.query_id === item.query_id;
                const isPinned = pinnedIds.has(item.query_id);

                return (
                  <div
                    key={item.query_id}
                    onClick={() => setSelectedQuery(item)}
                    className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'border-[#002B49] dark:border-amber-400 shadow-md bg-blue-50/20 dark:bg-slate-900/90'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                          {item.session_id.slice(0, 16)}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => togglePin(item.query_id, e)}
                          className={`p-1 rounded-md transition-colors ${
                            isPinned ? 'text-amber-500 bg-amber-50 dark:bg-cyan-500/10' : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                          title={isPinned ? 'Unpin Trace' : 'Pin Trace'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${health.bg}`}>
                          <HealthIcon className="w-3 h-3" />
                          {health.label}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-[#002B49] dark:group-hover:text-cyan-300 transition-colors mb-1.5">
                      "{item.question}"
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {item.answer}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-2.5 text-[11px]">
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono font-semibold ${
                            (item.confidence_score || 0) >= 0.9
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : (item.confidence_score || 0) >= 0.75
                              ? 'text-blue-700 dark:text-cyan-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          Conf: {Math.round((item.confidence_score || 0) * 100)}%
                        </span>

                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-[#002B49] dark:text-cyan-400" />
                          {item.response_time_sec ? `${item.response_time_sec}s` : '0.4s'}
                        </span>

                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          {item.total_retrieved_chunks || 3} sources
                        </span>

                        {item.user_rating === 1 && (
                          <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono border border-emerald-200 dark:border-emerald-800">
                            👍 +1
                          </span>
                        )}
                        {item.user_rating === -1 && (
                          <span className="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded font-mono border border-rose-200 dark:border-rose-800">
                            👎 -1
                          </span>
                        )}
                      </div>

                      {item.review_status && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 font-medium">
                          {item.review_status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* PANEL 3: RIGHT STICKY DEEP RAG TRACE EXPLORER INSPECTOR (~460px) */}
        {/* ========================================================================= */}
        {selectedQuery ? (
          <aside className="fixed xl:static inset-y-0 right-0 z-50 w-full sm:w-[460px] max-w-[100vw] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden shadow-2xl xl:shadow-lg transition-transform duration-300">
            {/* Inspector Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#002B49] dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-cyan-500/20 font-bold truncate">
                    {selectedQuery.query_id.slice(0, 18)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate">Deep RAG Trace Explorer</span>
                </div>
                <h3 className="text-xs text-slate-900 dark:text-slate-300 mt-1 line-clamp-1 font-semibold">
                  {selectedQuery.question}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(selectedQuery, null, 2), selectedQuery.query_id)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
                  title="Copy Full Trace Payload"
                >
                  {copiedId === selectedQuery.query_id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 7-Tab Navigation Bar */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px] font-medium overflow-x-auto scrollbar-none shrink-0">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'retrieval', label: 'Retrieval' },
                { id: 'prompt', label: 'Prompt' },
                { id: 'generation', label: 'Generation' },
                { id: 'documents', label: 'Documents' },
                { id: 'explanation', label: 'AI Explain' },
                { id: 'governance', label: 'Governance' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2.5 transition-colors whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[#002B49] text-[#002B49] dark:border-amber-400 dark:text-amber-400 font-semibold bg-blue-50/50 dark:bg-amber-400/5'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents Scroll Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                      Student Prompt
                    </span>
                    <p className="text-xs text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                      "{selectedQuery.question}"
                    </p>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-cyan-950/20 p-3.5 rounded-2xl border border-blue-200 dark:border-cyan-500/30 space-y-1 shadow-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#002B49] dark:text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Assistant Response
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {selectedQuery.answer}
                    </p>
                  </div>

                  {selectedQuery.user_rating && (
                    <div
                      className={`p-3 rounded-xl border text-xs space-y-1 shadow-xs ${
                        selectedQuery.user_rating === 1
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1">
                        {selectedQuery.user_rating === 1 ? '👍 Positive Feedback' : '👎 Negative Feedback'}
                      </span>
                      {selectedQuery.user_comments && (
                        <p className="text-[11px] opacity-90">"{selectedQuery.user_comments}"</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: RETRIEVAL */}
              {activeTab === 'retrieval' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-300 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-[#002B49] dark:text-cyan-400" />
                      Retrieved Vector Chunks (3 Matched)
                    </h4>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                      Hybrid RRF Active
                    </span>
                  </div>

                  {[
                    {
                      id: 'chunk-1',
                      doc: 'course_eligibility.json',
                      page: 1,
                      rank: 1,
                      score: 0.942,
                      category: 'admissions',
                      usedInAnswer: true,
                      snippet:
                        'Official CSJMU UIET Kanpur Admission Criteria 2025-26: Minimum eligibility for B.Tech Computer Science & Engineering (CSE) is 45% aggregate in 10+2 with Physics, Mathematics, and Chemistry/Computer Science for General category (40% for SC/ST). Admission is granted based on JEE Main ranks via UPTAC counseling.',
                    },
                    {
                      id: 'chunk-2',
                      doc: 'placements.txt',
                      page: 4,
                      rank: 2,
                      score: 0.815,
                      category: 'placements',
                      usedInAnswer: false,
                      snippet:
                        'UIET Kanpur B.Tech CSE Placement Highlights 2025: Highest package Rs. 22 LPA, Average package Rs. 6.5 LPA. Top recruiters include Infosys, TCS, Wipro, and Cognizant.',
                    },
                  ].map((chk) => (
                    <div key={chk.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-[#002B49] dark:text-cyan-400 font-bold">{chk.id}</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Similarity: {chk.score}</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
                        "{chk.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* OTHER TABS (Prompt, Generation, Documents, AI Explain, Governance) */}
              {(activeTab === 'prompt' || activeTab === 'generation' || activeTab === 'documents' || activeTab === 'explanation' || activeTab === 'governance') && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs text-xs">
                  <div className="flex items-center gap-2 text-[#002B49] dark:text-amber-400 font-bold">
                    <Activity className="w-4 h-4" />
                    <span className="capitalize">{activeTab} Diagnostics Payload</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p className="text-[#002B49] dark:text-cyan-400 font-semibold">// Pipeline Execution Telemetry</p>
                    <p>Model: {health?.llm?.model || 'Active LLM'} | Temperature: 0.0 | Top-K: 5</p>
                    <p>Embedding: {health?.embeddings?.model || 'nomic-embed-text'} | Vector Dim: 768</p>
                    <p>Response Latency: 0.44s | TTFT: 0.11s</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
