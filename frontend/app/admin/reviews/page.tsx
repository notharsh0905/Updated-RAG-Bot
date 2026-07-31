'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Copy,
  Check,
  Send,
  Database,
  Tag,
  Zap,
  FileText,
  FileCheck,
  UserCheck,
  Layers,
  ChevronRight,
  X,
  Plus,
  GitCommit,
  BarChart2,
  Flame,
  MessageSquare,
  ExternalLink,
  Edit3,
  TrendingUp,
} from 'lucide-react';
import { apiService } from '@/services/api';

interface ReviewTicketItem {
  ticket_id: string;
  query_id: string;
  session_id: string;
  question: string;
  answer: string;
  confidence_score: number;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Resolved' | 'Escalated';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assigned_reviewer: string;
  root_cause: string;
  user_rating?: number;
  user_comments?: string;
  created_at: string;
  department_category: string;
  official_source_snippet?: string;
}

export default function HumanReviewWorkspacePage() {
  const [tickets, setTickets] = useState<ReviewTicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePreset, setActivePreset] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [rootCauseFilter, setRootCauseFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Inspector & Action States
  const [selectedTicket, setSelectedTicket] = useState<ReviewTicketItem | null>(null);
  const [activeTab, setActiveTab] = useState<
    'evidence' | 'conversation' | 'trace' | 'actions' | 'notes' | 'timeline'
  >('evidence');

  // Interactive Form States
  const [currentStatus, setCurrentStatus] = useState<string>('Pending');
  const [currentPriority, setCurrentPriority] = useState<string>('Medium');
  const [currentRootCause, setCurrentRootCause] = useState<string>('Unknown');
  const [currentReviewer, setCurrentReviewer] = useState<string>('Admission Cell');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showKbModal, setShowKbModal] = useState<boolean>(false);

  // Load Review Tickets Feed
  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getQueryFeed({ limit: 100 });
      // Map query traces into review workspace items
      const mapped: ReviewTicketItem[] = data.map((q, idx) => ({
        ticket_id: q.ticket_id || `tkt_${String(idx + 101).padStart(5, '0')}`,
        query_id: q.query_id || `query_${idx}`,
        session_id: q.session_id || `session-uiet-${idx}`,
        question: q.question,
        answer: q.answer,
        confidence_score: q.confidence_score || 0.72,
        status: (q.review_status as any) || (q.user_rating === -1 ? 'Under Review' : 'Pending'),
        priority: (q.priority as any) || (q.user_rating === -1 ? 'High' : 'Medium'),
        assigned_reviewer: q.assigned_reviewer || 'Admission Cell',
        root_cause: q.root_cause || (q.user_rating === -1 ? 'Outdated Information' : 'Unknown'),
        user_rating: q.user_rating,
        user_comments: q.user_comments,
        created_at: q.timestamp || new Date(Date.now() - idx * 3600000).toISOString(),
        department_category: q.department_category || 'admissions',
        official_source_snippet:
          'Official CSJMU Prospectus 2025-26 (Page 14): Girls Hostel Fee is Rs. 48,500 per annum including Mess Advance and Security Deposit.',
      }));

      setTickets(mapped);
      if (mapped.length > 0 && !selectedTicket) {
        setSelectedTicket(mapped[0]);
      }
    } catch {
      setError('Failed to fetch governance tickets from server. Showing cached review workspace data.');
      // Fallback data
      const fallback: ReviewTicketItem[] = [
        {
          ticket_id: 'tkt_10294',
          query_id: 'query_8f9b2c1a-4d3e-4b2a-8c1d-9e8f7a6b5c4d',
          session_id: 'session-hostel-9912',
          question: 'What is the exact hostel fee for 1st year B.Tech girls at UIET Kanpur?',
          answer:
            'The hostel fee for B.Tech students is approximately Rs. 42,000 per annum including mess advance and security deposit.',
          confidence_score: 0.68,
          status: 'Under Review',
          priority: 'High',
          assigned_reviewer: 'Admission Cell',
          root_cause: 'Outdated Information',
          user_rating: -1,
          user_comments: 'Hostel fee figure is outdated; prospectus lists Rs. 48,500.',
          created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          department_category: 'hostels',
          official_source_snippet:
            'Official CSJMU Prospectus 2025-26 (Page 14): Girls Hostel Fee is Rs. 48,500 per annum including Mess Advance.',
        },
        {
          ticket_id: 'tkt_10295',
          query_id: 'query_05a1bd16-9cba-4a9f-832a-df9daf89b0c2',
          session_id: 'session-btech-uiet-8821',
          question: 'What is the minimum eligibility percentage for B.Tech CSE at UIET Kanpur?',
          answer:
            'The minimum eligibility for B.Tech Computer Science & Engineering (CSE) at UIET Kanpur is 45% aggregate in 10+2 with Physics, Mathematics, and Chemistry.',
          confidence_score: 0.93,
          status: 'Approved',
          priority: 'Low',
          assigned_reviewer: 'Academic Office',
          root_cause: 'None',
          user_rating: 1,
          created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          department_category: 'admissions',
          official_source_snippet:
            'UIET Kanpur Admission Guidelines 2025: B.Tech CSE eligibility is 45% in 10+2 PCM.',
        },
      ];
      setTickets(fallback);
      setSelectedTicket(fallback[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      setCurrentStatus(selectedTicket.status);
      setCurrentPriority(selectedTicket.priority);
      setCurrentRootCause(selectedTicket.root_cause);
      setCurrentReviewer(selectedTicket.assigned_reviewer);
      setAdminNotes(selectedTicket.user_comments ? `Student Note: ${selectedTicket.user_comments}` : '');
      setIsSaved(false);
    }
  }, [selectedTicket]);

  // Governance KPI Summaries
  const kpis = useMemo(() => {
    return {
      pending: tickets.filter((t) => t.status === 'Pending' || t.status === 'Under Review').length,
      critical: tickets.filter((t) => t.priority === 'Critical' || t.priority === 'High').length,
      resolvedToday: tickets.filter((t) => t.status === 'Resolved' || t.status === 'Approved').length,
      avgResolutionTime: '4.2h',
      openKbTasks: 3,
      negativeRate: '4.1%',
    };
  }, [tickets]);

  // Filtered review tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (searchQuery.trim()) {
        const qLower = searchQuery.toLowerCase();
        const mQ = t.question.toLowerCase().includes(qLower);
        const mA = t.answer.toLowerCase().includes(qLower);
        const mId = t.ticket_id.toLowerCase().includes(qLower) || t.session_id.toLowerCase().includes(qLower);
        if (!mQ && !mA && !mId) return false;
      }

      if (activePreset === 'pending' && t.status !== 'Pending' && t.status !== 'Under Review') return false;
      if (activePreset === 'critical' && t.priority !== 'Critical' && t.priority !== 'High') return false;
      if (activePreset === 'negative' && t.user_rating !== -1) return false;

      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (rootCauseFilter !== 'all' && t.root_cause !== rootCauseFilter) return false;
      if (departmentFilter !== 'all' && t.department_category !== departmentFilter) return false;

      return true;
    });
  }, [tickets, searchQuery, activePreset, statusFilter, priorityFilter, rootCauseFilter, departmentFilter]);

  const handleSaveTicket = () => {
    if (selectedTicket) {
      setTickets((prev) =>
        prev.map((t) =>
          t.ticket_id === selectedTicket.ticket_id
            ? {
                ...t,
                status: currentStatus as any,
                priority: currentPriority as any,
                root_cause: currentRootCause,
                assigned_reviewer: currentReviewer,
              }
            : t
        )
      );
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* ========================================================================= */}
      {/* TOP GOVERNANCE HEADER & KPI SUMMARY BAR */}
      {/* ========================================================================= */}
      <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800/80 px-4 sm:px-6 py-3 shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                Human Review Workspace
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  AI Governance Console
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Investigate AI answer discrepancies, manage review tickets, and trigger Knowledge Base updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket or question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={fetchTickets}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 6 Top Governance KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { label: 'Pending Reviews', value: kpis.pending, color: 'text-amber-400', icon: Clock },
            { label: 'Critical / High', value: kpis.critical, color: 'text-rose-400', icon: Flame },
            { label: 'Resolved Today', value: kpis.resolvedToday, color: 'text-emerald-400', icon: CheckCircle2 },
            { label: 'Avg Resolution', value: kpis.avgResolutionTime, color: 'text-cyan-400', icon: Zap },
            { label: 'Open KB Tasks', value: kpis.openKbTasks, color: 'text-indigo-400', icon: Layers },
            { label: 'Negative Rate', value: kpis.negativeRate, color: 'text-slate-300', icon: TrendingUp },
          ].map((kpi, idx) => {
            const KIcon = kpi.icon;
            return (
              <div key={idx} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">{kpi.label}</span>
                  <span className={`text-sm font-bold font-mono ${kpi.color}`}>{kpi.value}</span>
                </div>
                <KIcon className={`w-4 h-4 ${kpi.color} opacity-80`} />
              </div>
            );
          })}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3-PANEL GOVERNANCE WORKSPACE CONTAINER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANEL 1: WORK QUEUE PRESETS & FILTER SIDEBAR (~300px) */}
        <aside className="w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 space-y-5 overflow-y-auto">
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                Work Queue Presets
              </h2>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Review Tickets', icon: Layers, count: tickets.length },
                  { id: 'pending', label: 'Pending & Under Review', icon: Clock, count: kpis.pending, badge: 'bg-amber-500/20 text-amber-400' },
                  { id: 'critical', label: 'Critical / High Priority', icon: ShieldAlert, count: kpis.critical, badge: 'bg-rose-500/20 text-rose-400' },
                  { id: 'negative', label: 'Negative Feedback (👎)', icon: XCircle, count: tickets.filter((t) => t.user_rating === -1).length, badge: 'bg-rose-500/20 text-rose-400' },
                ].map((preset) => {
                  const IconComp = preset.icon;
                  const isActive = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setActivePreset(preset.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span>{preset.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${preset.badge || 'bg-slate-800 text-slate-400'}`}>
                        {preset.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-800/80 pt-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                Refine Matrix
              </h2>

              <div className="space-y-1 px-1">
                <label className="text-[11px] text-slate-400">Review Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>

              <div className="space-y-1 px-1">
                <label className="text-[11px] text-slate-400">Priority Level</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="space-y-1 px-1">
                <label className="text-[11px] text-slate-400">Root Cause Category</label>
                <select
                  value={rootCauseFilter}
                  onChange={(e) => setRootCauseFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Root Causes</option>
                  <option value="Outdated Information">Outdated Information</option>
                  <option value="Missing Document">Missing Document</option>
                  <option value="Wrong Retrieval">Wrong Retrieval</option>
                  <option value="Prompt Issue">Prompt Issue</option>
                  <option value="Hallucination">Hallucination</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* PANEL 2: REVIEW CARDS WORK QUEUE FEED */}
        <main className="flex-1 border-r border-slate-800/80 flex flex-col min-w-0 bg-slate-900">
          <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-400 font-medium">
              Queue: <strong className="text-slate-200">{filteredTickets.length}</strong> tickets
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3 animate-pulse">
                  <div className="h-4 w-32 bg-slate-800 rounded" />
                  <div className="h-5 w-3/4 bg-slate-800 rounded" />
                </div>
              ))
            ) : filteredTickets.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800/60 my-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <h3 className="text-sm font-semibold text-slate-200">No Review Tickets Pending</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  All flagged AI queries and student feedback tickets have been investigated and resolved!
                </p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.ticket_id === t.ticket_id;
                return (
                  <div
                    key={t.ticket_id}
                    onClick={() => setSelectedTicket(t)}
                    className={`group bg-slate-950/70 border rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500/80 shadow-lg shadow-cyan-950/50 bg-slate-900/90'
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {t.ticket_id}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            t.priority === 'Critical' || t.priority === 'High'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {t.priority}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-medium">
                          {t.status}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-2 group-hover:text-cyan-300 transition-colors mb-1.5">
                      "{t.question}"
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {t.answer}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5 text-[11px]">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">Reviewer: <strong className="text-slate-200">{t.assigned_reviewer}</strong></span>
                        <span className="text-amber-400 font-mono">Root Cause: {t.root_cause}</span>
                      </div>

                      {t.user_rating === -1 && (
                        <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-mono text-[10px] border border-rose-500/20">
                          👎 Negative Feedback
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* PANEL 3: RIGHT STICKY REVIEW INSPECTOR WORKSPACE (~480px) */}
        {selectedTicket ? (
          <aside className="w-[480px] bg-slate-950 border-l border-slate-800/80 flex flex-col shrink-0 overflow-hidden hidden xl:flex">
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {selectedTicket.ticket_id}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">Governance Review Workspace</span>
                </div>
                <h3 className="text-xs text-slate-300 mt-1 line-clamp-1">
                  {selectedTicket.question}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950 text-[11px] font-medium overflow-x-auto shrink-0">
              {[
                { id: 'evidence', label: 'Evidence Comparison' },
                { id: 'conversation', label: 'Conversation' },
                { id: 'actions', label: 'Resolution Actions' },
                { id: 'notes', label: 'Notes & KB Task' },
                { id: 'timeline', label: 'Audit Trail' },
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

            {/* Tab Body Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: EVIDENCE COMPARISON (AI Answer vs Official Document Source) */}
              {activeTab === 'evidence' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-rose-950/20 p-3.5 rounded-2xl border border-rose-500/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Discrepant AI Answer Generated
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-mono">
                      "{selectedTicket.answer}"
                    </p>
                  </div>

                  <div className="bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> Verifiable Official Source Text
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-mono">
                      "{selectedTicket.official_source_snippet}"
                    </p>
                  </div>

                  {/* Highlighted Difference Comparison Box */}
                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Difference Highlight Analysis
                    </span>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono leading-relaxed space-y-1">
                      <p className="text-rose-400">- AI Output: Hostel Fee Rs. 42,000 per annum</p>
                      <p className="text-emerald-400">+ Official Source: Girls Hostel Fee Rs. 48,500 per annum (2025-26 Circular)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONVERSATION THREAD */}
              {activeTab === 'conversation' && (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Student Question</span>
                    <p className="text-xs font-medium text-slate-200">"{selectedTicket.question}"</p>
                  </div>

                  <div className="bg-cyan-950/20 p-3 rounded-xl border border-cyan-500/30 space-y-1">
                    <span className="text-[10px] text-cyan-400 uppercase font-semibold">Assistant Response</span>
                    <p className="text-xs text-slate-200 leading-relaxed">{selectedTicket.answer}</p>
                  </div>
                </div>
              )}

              {/* TAB 3: RESOLUTION ACTIONS & AUTOMATION TRIGGERS */}
              {activeTab === 'actions' && (
                <div className="space-y-4 text-xs">
                  {/* Root Cause Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400">Identify Root Cause</label>
                    <select
                      value={currentRootCause}
                      onChange={(e) => setCurrentRootCause(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Outdated Information">Outdated Information</option>
                      <option value="Missing Document">Missing Document</option>
                      <option value="Wrong Retrieval">Wrong Retrieval</option>
                      <option value="Prompt Issue">Prompt Issue</option>
                      <option value="Hallucination">Hallucination</option>
                    </select>
                  </div>

                  {/* Smart Automation Trigger Banner */}
                  {currentRootCause === 'Missing Document' && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                      <span className="font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Smart Automation Trigger: Missing Document
                      </span>
                      <p className="text-[11px] opacity-90">
                        Automatically create a Knowledge Improvement Task to request missing PDF prospectus from the admission cell.
                      </p>
                      <button
                        onClick={() => setShowKbModal(true)}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
                      >
                        Auto-Create KB Task
                      </button>
                    </div>
                  )}

                  {currentRootCause === 'Outdated Information' && (
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 space-y-2">
                      <span className="font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Smart Automation Trigger: Replace Document
                      </span>
                      <p className="text-[11px] opacity-90">
                        Flag outdated document chunk for replacement in Knowledge Ingestion pipeline.
                      </p>
                      <button
                        onClick={() => alert('Document replacement task flagged for Knowledge Ingestion!')}
                        className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                      >
                        Flag Document for Replacement
                      </button>
                    </div>
                  )}

                  {/* Resolution Buttons Grid */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Resolution Workflow Actions</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setCurrentStatus('Approved');
                          handleSaveTicket();
                        }}
                        className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
                      >
                        Approve Answer
                      </button>
                      <button
                        onClick={() => {
                          setCurrentStatus('Resolved');
                          handleSaveTicket();
                        }}
                        className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => {
                          setCurrentStatus('Escalated');
                          handleSaveTicket();
                        }}
                        className="py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-colors"
                      >
                        Escalate Ticket
                      </button>
                      <button
                        onClick={() => setShowKbModal(true)}
                        className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
                      >
                        Create KB Task
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: REVIEWER NOTES & KB TASK CREATION */}
              {activeTab === 'notes' && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-400">Reviewer Governance Notes</label>
                    <textarea
                      rows={4}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Enter investigation notes..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none text-xs"
                    />
                  </div>

                  <button
                    onClick={handleSaveTicket}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    {isSaved ? 'Saved Governance Notes!' : 'Save Governance Notes'}
                  </button>
                </div>
              )}

              {/* TAB 5: AUDIT TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-3 text-xs">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
                    Governance Audit Trail
                  </h4>

                  <div className="relative border-l-2 border-slate-800 ml-3 pl-4 space-y-4">
                    {[
                      { title: 'Ticket Created', desc: 'Negative feedback submitted by student', time: '10 mins ago', actor: 'Student User' },
                      { title: 'Assigned to Reviewer', desc: 'Auto-routed to Admission Cell', time: '8 mins ago', actor: 'Governance System' },
                      { title: 'Investigation Started', desc: 'Discrepancy identified in 2025-26 hostel fee prospectus chunk', time: '3 mins ago', actor: 'Admission Cell' },
                    ].map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-400" />
                        <div className="flex justify-between items-center">
                          <h5 className="font-semibold text-slate-200">{step.title}</h5>
                          <span className="text-[10px] font-mono text-slate-500">{step.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        ) : null}
      </div>

      {/* ========================================================================= */}
      {/* KB TASK CREATION MODAL SHORTCUT */}
      {/* ========================================================================= */}
      {showKbModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Create KB Improvement Task
              </h3>
              <button onClick={() => setShowKbModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Task Summary</label>
                <input
                  type="text"
                  defaultValue={`Update prospectus chunk for: "${selectedTicket.question.slice(0, 40)}..."`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Department Assigned</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                  <option>Admission Cell</option>
                  <option>Hostel Office</option>
                  <option>Scholarship Desk</option>
                  <option>Academic Registrar</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Suggested Fix</label>
                <textarea
                  rows={3}
                  defaultValue={`Replace old 2024 fee table chunk with updated 2025-26 circular.`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowKbModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Knowledge Base Task dispatched successfully!');
                  setShowKbModal(false);
                }}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors text-xs"
              >
                Dispatch Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
