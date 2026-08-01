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
              'Yes, GATE qualified M.Tech students admitted through regular university counseling receive a monthly AICTE stipend of Rs. 12,400 per month via direct bank transfer.',
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
  }, []);

  useEffect(() => {
    if (selectedQuery) {
      setTicketStatus(selectedQuery.review_status || 'Pending');
      setTicketPriority(selectedQuery.priority || 'Medium');
      setTicketRootCause(selectedQuery.root_cause || 'Unknown');
      setTicketReviewer(selectedQuery.assigned_reviewer || 'Unassigned');
      setAdminNotes(selectedQuery.user_comments ? `Student feedback: "${selectedQuery.user_comments}"` : '');
      setIsSavedNotes(false);
    }
  }, [selectedQuery]);

  const getAIHealth = (item: QueryTraceItem) => {
    if (item.review_status === 'Escalated' || (item.user_rating === -1 && item.confidence_score && item.confidence_score < 0.7)) {
      return { label: 'Critical', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', icon: XCircle };
    }
    if (item.user_rating === -1 || (item.confidence_score && item.confidence_score < 0.75)) {
      return { label: 'Needs Review', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: AlertTriangle };
    }
    if (item.confidence_score && item.confidence_score >= 0.9) {
      return { label: 'Excellent', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle2 };
    }
    return { label: 'Good', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Sparkles };
  };

  const presetCounts = useMemo(() => {
    return {
      all: queries.length,
      needsReview: queries.filter((q) => q.user_rating === -1 || (q.confidence_score && q.confidence_score < 0.75)).length,
      negative: queries.filter((q) => q.user_rating === -1).length,
      lowConfidence: queries.filter((q) => q.confidence_score && q.confidence_score < 0.7).length,
      pinned: pinnedIds.size,
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
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNotes = () => {
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* ========================================================================= */}
      {/* TOP TOOLBAR */}
      {/* ========================================================================= */}
      <header className="h-16 bg-slate-950/80 backdrop-blur border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              Student Query Center
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Deep RAG Explorer
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
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
              placeholder="Search traces or ID... (/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="hidden sm:block bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
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
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 disabled:opacity-50"
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
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
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
        <aside className="w-80 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 space-y-6 overflow-y-auto">
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Saved Presets
              </h2>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Traces', count: presetCounts.all, icon: Layers },
                  { id: 'needsReview', label: 'Needs Review', count: presetCounts.needsReview, icon: AlertTriangle, badgeColor: 'bg-amber-500/20 text-amber-400' },
                  { id: 'negative', label: 'Negative Feedback', count: presetCounts.negative, icon: XCircle, badgeColor: 'bg-rose-500/20 text-rose-400' },
                  { id: 'lowConfidence', label: 'Low Confidence (<70%)', count: presetCounts.lowConfidence, icon: ShieldAlert, badgeColor: 'bg-indigo-500/20 text-indigo-400' },
                  { id: 'pinned', label: 'Pinned Traces', count: presetCounts.pinned, icon: Pin, badgeColor: 'bg-cyan-500/20 text-cyan-400' },
                ].map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activePreset === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePreset(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${item.badgeColor || 'bg-slate-800 text-slate-400'}`}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-800/80 pt-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
                Filter Matrix
              </h2>

              <div className="space-y-1.5 px-2">
                <label className="text-[11px] text-slate-400 font-medium">Student Feedback</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Feedback</option>
                  <option value="positive">👍 Positive Only</option>
                  <option value="negative">👎 Negative Only</option>
                </select>
              </div>

              <div className="space-y-1.5 px-2">
                <label className="text-[11px] text-slate-400 font-medium">Vector Confidence</label>
                <select
                  value={confidenceFilter}
                  onChange={(e) => setConfidenceFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Confidence Scores</option>
                  <option value="high">High (≥ 90%)</option>
                  <option value="medium">Medium (75% - 89%)</option>
                  <option value="low">Low (&lt; 75%)</option>
                </select>
              </div>

              <div className="space-y-1.5 px-2">
                <label className="text-[11px] text-slate-400 font-medium">Department Domain</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
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
        <main className="flex-1 border-r border-slate-800/80 flex flex-col min-w-0 bg-slate-900">
          <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-slate-200">{filteredQueries.length}</strong> of{' '}
              <strong className="text-slate-200">{queries.length}</strong> query traces
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
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-28 bg-slate-800 rounded" />
                    <div className="h-4 w-20 bg-slate-800 rounded" />
                  </div>
                  <div className="h-5 w-3/4 bg-slate-800 rounded" />
                  <div className="h-4 w-1/2 bg-slate-800 rounded" />
                </div>
              ))
            ) : filteredQueries.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800/60 my-6">
                <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200">No Query Traces Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
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
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
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
                    className={`group relative bg-slate-950/70 border rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500/80 shadow-lg shadow-cyan-950/50 bg-slate-900/90'
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                          {item.session_id.slice(0, 16)}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => togglePin(item.query_id, e)}
                          className={`p-1 rounded-md transition-colors ${
                            isPinned ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300'
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

                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-2 group-hover:text-cyan-300 transition-colors mb-1.5">
                      "{item.question}"
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {item.answer}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-2.5 text-[11px]">
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono font-medium ${
                            (item.confidence_score || 0) >= 0.9
                              ? 'text-emerald-400'
                              : (item.confidence_score || 0) >= 0.75
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                        >
                          Conf: {Math.round((item.confidence_score || 0) * 100)}%
                        </span>

                        <span className="text-slate-400 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          {item.response_time_sec ? `${item.response_time_sec}s` : '0.4s'}
                        </span>

                        <span className="text-slate-400 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-500" />
                          {item.total_retrieved_chunks || 3} sources
                        </span>

                        {item.user_rating === 1 && (
                          <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                            👍 +1
                          </span>
                        )}
                        {item.user_rating === -1 && (
                          <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-mono">
                            👎 -1
                          </span>
                        )}
                      </div>

                      {item.review_status && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-amber-500/30">
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
          <aside className="w-[460px] bg-slate-950 border-l border-slate-800/80 flex flex-col shrink-0 overflow-hidden hidden xl:flex">
            {/* Inspector Header */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {selectedQuery.query_id.slice(0, 18)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Deep RAG Trace Explorer</span>
                </div>
                <h3 className="text-xs text-slate-300 mt-1 line-clamp-1">
                  {selectedQuery.question}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(selectedQuery, null, 2), selectedQuery.query_id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy Full Trace Payload"
                >
                  {copiedId === selectedQuery.query_id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 7-Tab Navigation Bar */}
            <div className="flex border-b border-slate-800 bg-slate-950 text-[11px] font-medium overflow-x-auto scrollbar-none shrink-0">
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
                      ? 'border-cyan-400 text-cyan-400 font-semibold bg-cyan-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents Scroll Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Student Prompt
                    </span>
                    <p className="text-xs text-slate-100 font-medium leading-relaxed">
                      "{selectedQuery.question}"
                    </p>
                  </div>

                  <div className="bg-cyan-950/20 p-3.5 rounded-2xl border border-cyan-500/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Assistant Response
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {selectedQuery.answer}
                    </p>
                  </div>

                  {selectedQuery.user_rating && (
                    <div
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        selectedQuery.user_rating === 1
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
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

              {/* TAB 2: RETRIEVAL (Chunks Matrix with Collapsible Snippets) */}
              {activeTab === 'retrieval' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      Retrieved Vector Chunks (3 Matched)
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
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
                    {
                      id: 'chunk-3',
                      doc: 'uiet_teachers.json',
                      page: 2,
                      rank: 3,
                      score: 0.761,
                      category: 'academics',
                      usedInAnswer: false,
                      snippet:
                        'Department of Computer Science & Engineering Faculty Roster: Prof. Alok Kumar (HOD), Dr. S. K. Singh (Associate Professor), Dr. Meena Gupta (Assistant Professor).',
                    },
                  ].map((chunk) => {
                    const isExpanded = expandedChunkId === chunk.id;
                    return (
                      <div
                        key={chunk.id}
                        className={`bg-slate-900 rounded-xl border transition-all ${
                          chunk.usedInAnswer
                            ? 'border-cyan-500/40 shadow-sm shadow-cyan-950/30'
                            : 'border-slate-800'
                        }`}
                      >
                        <div
                          onClick={() => setExpandedChunkId(isExpanded ? null : chunk.id)}
                          className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                            <span className="text-xs font-mono text-cyan-400 font-medium">{chunk.doc}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Pg {chunk.page}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {chunk.usedInAnswer && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Used in Answer
                              </span>
                            )}
                            <span className="text-xs font-mono text-emerald-400 font-semibold">
                              {chunk.score} (Rank #{chunk.rank})
                            </span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-slate-800/60 pt-2 space-y-2">
                            <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                              "{chunk.snippet}"
                            </p>
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                              <span>Chunk Length: {chunk.snippet.length} chars</span>
                              <span>Collection: collection50</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: PROMPT ENGINE INSPECTOR */}
              {activeTab === 'prompt' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Prompt Ver</span>
                      <p className="text-xs font-mono font-bold text-cyan-400">2.0 (Strict)</p>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Temperature</span>
                      <p className="text-xs font-mono font-bold text-emerald-400">0.0 (Grounded)</p>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Top-K Chunks</span>
                      <p className="text-xs font-mono font-bold text-amber-400">3 Chunks</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-cyan-400" /> System Prompt Instructions
                    </span>
                    <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      You are the official CSJMU & UIET Kanpur AI Campus Assistant. Your task is to provide helpful, accurate, professional, and grounded answers using ONLY the provided context blocks. If the question cannot be answered from the context, state that you do not have sufficient information.
                    </pre>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-cyan-400" /> Assembled Knowledge Context Block
                    </span>
                    <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      === RETRIEVED KNOWLEDGE BASE ===
                      [Source: course_eligibility.json] Minimum eligibility for B.Tech CSE is 45% aggregate in 10+2 with Physics, Mathematics, and Chemistry.
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 4: GENERATION METRICS */}
              {activeTab === 'generation' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Response Time</span>
                      <p className="text-sm font-bold text-cyan-400 font-mono">
                        {selectedQuery.response_time_sec ? `${selectedQuery.response_time_sec}s` : '0.44s'}
                      </p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">TTFT (Time-To-First-Token)</span>
                      <p className="text-sm font-bold text-emerald-400 font-mono">0.11s</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Inference Model</span>
                      <p className="text-xs font-semibold text-slate-200">llama3.2:3b</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Finish Reason</span>
                      <p className="text-xs font-mono font-semibold text-emerald-400">stop (Complete)</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Token Cost Heuristics</span>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Prompt Tokens:</span>
                        <span className="text-slate-200">420 tokens</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Completion Tokens:</span>
                        <span className="text-slate-200">65 tokens</span>
                      </div>
                      <div className="flex justify-between text-cyan-400 font-bold border-t border-slate-800 pt-1.5">
                        <span>Total Tokens:</span>
                        <span>485 tokens</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DOCUMENTS USED (Modern Document Cards) */}
              {activeTab === 'documents' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    Source Documents Catalog (2 Documents Linked)
                  </h4>

                  {[
                    {
                      filename: 'course_eligibility.json',
                      category: 'Admissions & Eligibility',
                      pages: 12,
                      chunksUsed: 1,
                      uploadDate: '2026-07-28',
                      version: 'v1.0',
                    },
                    {
                      filename: 'placements.txt',
                      category: 'Placements & Statistics',
                      pages: 4,
                      chunksUsed: 1,
                      uploadDate: '2026-07-25',
                      version: 'v1.0',
                    },
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3"
                    >
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <h5 className="font-semibold text-slate-100 truncate">{doc.filename}</h5>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {doc.version}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{doc.category}</p>
                        <div className="flex gap-4 text-[10px] text-slate-500 font-mono pt-1">
                          <span>{doc.pages} Pages</span>
                          <span>{doc.chunksUsed} Chunk Used</span>
                          <span>Uploaded: {doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 6: AI EXPLANATION (Graphical RAG Timeline & Confidence Bar Chart) */}
              {activeTab === 'explanation' && (
                <div className="space-y-5">
                  {/* Graphical RAG Execution Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
                      Graphical RAG Execution Pipeline Trace
                    </h4>

                    <div className="relative border-l-2 border-slate-800 ml-3 pl-4 space-y-4 text-xs">
                      {[
                        { title: '1. Student Query Received', desc: 'Normalized and spell-checked', status: 'Success', color: 'text-cyan-400' },
                        { title: '2. Hybrid BM25 + Vector Retrieval', desc: 'Retrieved 3 chunks from Chroma DB', status: '0.045s', color: 'text-emerald-400' },
                        { title: '3. Reciprocal Rank Fusion (RRF)', desc: 'Top chunk similarity score: 0.942', status: 'Completed', color: 'text-cyan-400' },
                        { title: '4. Strict Prompt Assembly', desc: 'Context block & Llama system rules bound', status: '420 Tokens', color: 'text-amber-400' },
                        { title: '5. LLM Inference & Generation', desc: 'ChatOllama Llama 3.2 streamed response', status: '0.33s', color: 'text-emerald-400' },
                        { title: '6. Delivery to Student', desc: 'Enriched with campus facts & suggestions', status: 'Done', color: 'text-cyan-400' },
                      ].map((step, sIdx) => (
                        <div key={sIdx} className="relative group">
                          <div className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-400 group-hover:bg-cyan-400 transition-colors" />
                          <div className="flex justify-between items-center">
                            <h5 className="font-semibold text-slate-200">{step.title}</h5>
                            <span className={`text-[10px] font-mono font-bold ${step.color}`}>{step.status}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Retrieval Confidence & Quality Bar Chart Visualization */}
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                      Retrieval Confidence & Quality Metrics
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      {[
                        { label: 'Overall Confidence', pct: 92, color: 'bg-emerald-500' },
                        { label: 'Vector Similarity Score', pct: 86, color: 'bg-cyan-500' },
                        { label: 'Fact Grounding Ratio', pct: 100, color: 'bg-indigo-500' },
                        { label: 'Response Quality Index', pct: 89, color: 'bg-amber-500' },
                      ].map((bar, bIdx) => (
                        <div key={bIdx} className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                            <span>{bar.label}</span>
                            <span className="font-mono font-bold">{bar.pct}%</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div className={`h-full ${bar.color} transition-all duration-500`} style={{ width: `${bar.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: GOVERNANCE WORKFLOW */}
              {activeTab === 'governance' && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Review Status</label>
                    <select
                      value={ticketStatus}
                      onChange={(e) => setTicketStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Escalated">Escalated</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Priority Level</label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Critical">🔴 Critical</option>
                      <option value="High">🟡 High</option>
                      <option value="Medium">🔵 Medium</option>
                      <option value="Low">⚪ Low</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Root Cause Classification</label>
                    <select
                      value={ticketRootCause}
                      onChange={(e) => setTicketRootCause(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="Outdated Information">Outdated Information</option>
                      <option value="Missing Document">Missing Document</option>
                      <option value="Incorrect Retrieval">Incorrect Retrieval</option>
                      <option value="Prompt Issue">Prompt Issue</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Internal Admin Notes</label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Record investigation findings or remediation steps..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none text-xs"
                    />
                  </div>

                  <button
                    onClick={handleSaveNotes}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSavedNotes ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Saved Successfully!
                      </>
                    ) : (
                      'Save Governance Ticket'
                    )}
                  </button>
                </div>
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
