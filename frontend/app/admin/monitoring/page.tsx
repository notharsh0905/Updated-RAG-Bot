'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronRight,
  MessageSquare,
  BookOpen,
  History,
  Edit3,
  Save,
  X,
  TrendingDown,
  LayoutDashboard,
  Layers,
  BarChart3,
  Plus,
} from 'lucide-react';
import { apiService } from '@/services/api';
import {
  NegativeFeedbackItem,
  WorkflowStatus,
  ReviewPriority,
  RootCauseCategory,
  ReviewerTeam,
  QualityCenterAnalytics,
  KBImprovementTask,
  FeedbackFilter,
} from '@/types/admin';

// Modular Component Imports
import { QualityDashboard } from '@/components/admin/quality/QualityDashboard';
import { ReviewTable } from '@/components/admin/quality/ReviewTable';
import { PriorityBadge } from '@/components/admin/quality/PriorityBadge';
import { RootCauseBadge } from '@/components/admin/quality/RootCauseBadge';
import { ReviewerSelector } from '@/components/admin/quality/ReviewerSelector';
import { KBTaskPanel } from '@/components/admin/quality/KBTaskPanel';
import { RecommendationPanel } from '@/components/admin/quality/RecommendationPanel';
import { AnalyticsCharts } from '@/components/admin/quality/AnalyticsCharts';
import { ExportActions } from '@/components/admin/quality/ExportActions';

export default function AdminQualityCenterPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'needs-review' | 'kb-tasks' | 'analytics' | 'resolved'>('overview');

  const [items, setItems] = useState<NegativeFeedbackItem[]>([]);
  const [tasks, setTasks] = useState<KBImprovementTask[]>([]);
  const [analytics, setAnalytics] = useState<QualityCenterAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter State
  const [filter, setFilter] = useState<FeedbackFilter>({
    searchQuery: '',
    status: 'All',
    reviewer: 'All',
    rootCause: 'All',
    priority: 'All',
    sortBy: 'newest',
  });

  // Modal State
  const [selectedItem, setSelectedItem] = useState<NegativeFeedbackItem | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'sources' | 'history' | 'notes' | 'recommendation'>('recommendation');
  const [sessionMessages, setSessionMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [adminNoteText, setAdminNoteText] = useState<string>('');
  const [savingNote, setSavingNote] = useState<boolean>(false);
  const [noteSavedMsg, setNoteSavedMsg] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const itemsData = await apiService.getQualityCenterItems();
      const tasksData = await apiService.getKBTasks();
      const analyticsData = await apiService.getQualityCenterAnalytics();
      setItems(itemsData);
      setTasks(tasksData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load quality center governance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetail = async (item: NegativeFeedbackItem) => {
    setSelectedItem(item);
    setAdminNoteText(item.adminNotes || '');
    setActiveModalTab('recommendation');
    setNoteSavedMsg(false);

    try {
      const history = await apiService.getSessionHistory(item.sessionId);
      setSessionMessages(history);
    } catch {
      setSessionMessages([
        { role: 'user', content: item.question },
        { role: 'assistant', content: item.answer },
      ]);
    }
  };

  const handleUpdateReviewer = async (id: string, reviewer: ReviewerTeam) => {
    const updated = await apiService.updateReviewerAssignment(id, reviewer);
    setItems(updated);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, assignedReviewer: reviewer });
    }
    const stats = await apiService.getQualityCenterAnalytics();
    setAnalytics(stats);
  };

  const handleUpdateStatus = async (id: string, newStatus: WorkflowStatus) => {
    const updated = await apiService.updateWorkflowStatus(id, newStatus);
    setItems(updated);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, status: newStatus });
    }
    const stats = await apiService.getQualityCenterAnalytics();
    setAnalytics(stats);
  };

  const handleUpdatePriority = async (id: string, priority: ReviewPriority) => {
    const updated = await apiService.updateReviewPriority(id, priority);
    setItems(updated);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, priority });
    }
  };

  const handleUpdateRootCause = async (id: string, rootCause: RootCauseCategory) => {
    const updated = await apiService.updateRootCauseCategory(id, rootCause);
    setItems(updated);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, rootCause });
    }
  };

  const handleSaveNote = async () => {
    if (!selectedItem) return;
    setSavingNote(true);
    try {
      const updated = await apiService.addAdminNote(selectedItem.id, adminNoteText);
      setItems(updated);
      setSelectedItem({ ...selectedItem, adminNotes: adminNoteText });
      setNoteSavedMsg(true);
      setTimeout(() => setNoteSavedMsg(false), 2500);
    } finally {
      setSavingNote(false);
    }
  };

  // Create KB Task from Modal Shortcut
  const handleCreateKBTaskFromItem = async () => {
    if (!selectedItem) return;
    await apiService.createKBTask({
      reviewId: selectedItem.id,
      question: selectedItem.question,
      problemSummary: `${selectedItem.reason}: ${selectedItem.comments || 'User rated response negatively.'}`,
      suggestedFix: selectedItem.aiRecommendation?.recommendedAction || 'Update vector chunk metadata.',
      requiredDocument: selectedItem.sources?.[0]?.source || 'CSJMU_Official_Rules_Handbook.pdf',
      assignedTeam: selectedItem.assignedReviewer !== 'Unassigned' ? selectedItem.assignedReviewer : 'Knowledge Base Team',
      priority: selectedItem.priority,
      status: 'Open',
    });
    const refreshedTasks = await apiService.getKBTasks();
    setTasks(refreshedTasks);
    const stats = await apiService.getQualityCenterAnalytics();
    setAnalytics(stats);
    setActiveTab('kb-tasks');
    setSelectedItem(null);
  };

  // Filter Items
  const filteredItems = items
    .filter((item) => {
      // Tab-specific filters
      if (activeTab === 'needs-review') {
        if (!['New', 'Assigned', 'Investigating', 'Waiting for KB Update'].includes(item.status)) return false;
      } else if (activeTab === 'resolved') {
        if (!['Resolved', 'Closed'].includes(item.status)) return false;
      }

      // Search Query
      const q = filter.searchQuery.toLowerCase().trim();
      if (q) {
        const inQ = item.question.toLowerCase().includes(q);
        const inA = item.answer.toLowerCase().includes(q);
        const inR = item.reason.toLowerCase().includes(q);
        const inS = item.sessionId.toLowerCase().includes(q);
        if (!inQ && !inA && !inR && !inS) return false;
      }

      // Status
      if (filter.status !== 'All' && item.status !== filter.status) return false;

      // Reviewer
      if (filter.reviewer !== 'All' && item.assignedReviewer !== filter.reviewer) return false;

      // Root Cause
      if (filter.rootCause !== 'All' && item.rootCause !== filter.rootCause) return false;

      // Priority
      if (filter.priority !== 'All' && item.priority !== filter.priority) return false;

      return true;
    })
    .sort((a, b) => {
      if (filter.sortBy === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (filter.sortBy === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (filter.sortBy === 'priority') {
        const pMap: Record<ReviewPriority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      return a.status.localeCompare(b.status);
    });

  const openReviewsCount = items.filter((i) =>
    ['New', 'Assigned', 'Investigating', 'Waiting for KB Update'].includes(i.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#002B49] text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#002B49] dark:text-white tracking-tight font-serif">
                AI Quality Center (Enterprise AI Governance)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official quality management, reviewer assignment, root cause classification, and knowledge base tasks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ExportActions items={filteredItems} />
        </div>
      </div>

      {/* 5 Sub-Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 overflow-x-auto rounded-xl shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-[#8B0000] text-[#002B49] dark:text-amber-400 bg-slate-50 dark:bg-slate-800/60'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('needs-review')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'needs-review'
                ? 'border-[#8B0000] text-[#002B49] dark:text-amber-400 bg-slate-50 dark:bg-slate-800/60'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Needs Review</span>
            {openReviewsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-extrabold">
                {openReviewsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('kb-tasks')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'kb-tasks'
                ? 'border-[#8B0000] text-[#002B49] dark:text-amber-400 bg-slate-50 dark:bg-slate-800/60'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Knowledge Base Tasks</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
              {tasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'border-[#8B0000] text-[#002B49] dark:text-amber-400 bg-slate-50 dark:bg-slate-800/60'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'resolved'
                ? 'border-[#8B0000] text-[#002B49] dark:text-amber-400 bg-slate-50 dark:bg-slate-800/60'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Resolved Cases</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <QualityDashboard
          analytics={analytics}
          onNavigateToReviews={() => setActiveTab('needs-review')}
          onNavigateToTasks={() => setActiveTab('kb-tasks')}
        />
      )}

      {/* Tab 2 & Tab 5: Needs Review & Resolved Cases (Review Queue View) */}
      {(activeTab === 'needs-review' || activeTab === 'resolved') && (
        <div className="space-y-4">
          {/* Search & Multi-Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filter.searchQuery}
                  onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
                  placeholder="Search questions, responses, session ID..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B49] dark:focus:ring-amber-400"
                />
              </div>

              {/* Filter Selectors */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end text-xs">
                {/* Reviewer Filter */}
                <select
                  value={filter.reviewer}
                  onChange={(e) => setFilter({ ...filter, reviewer: e.target.value as any })}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Reviewers</option>
                  <option value="Unassigned">Unassigned</option>
                  <option value="Admission Cell">Admission Cell</option>
                  <option value="IT Cell">IT Cell</option>
                  <option value="Knowledge Base Team">Knowledge Base Team</option>
                  <option value="Registrar Office">Registrar Office</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={filter.priority}
                  onChange={(e) => setFilter({ ...filter, priority: e.target.value as any })}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                {/* Root Cause Filter */}
                <select
                  value={filter.rootCause}
                  onChange={(e) => setFilter({ ...filter, rootCause: e.target.value as any })}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Root Causes</option>
                  <option value="Missing Document">Missing Document</option>
                  <option value="Outdated Information">Outdated Information</option>
                  <option value="Incorrect Retrieval">Incorrect Retrieval</option>
                  <option value="Prompt Issue">Prompt Issue</option>
                  <option value="Hallucination">Hallucination</option>
                  <option value="Metadata Error">Metadata Error</option>
                  <option value="Duplicate Chunk">Duplicate Chunk</option>
                  <option value="Unknown">Unknown</option>
                </select>

                {/* Sort By */}
                <select
                  value={filter.sortBy}
                  onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="oldest">Sort: Oldest</option>
                  <option value="priority">Sort by Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Review Table */}
          <ReviewTable
            items={filteredItems}
            onOpenDetail={handleOpenDetail}
            onUpdateReviewer={handleUpdateReviewer}
          />
        </div>
      )}

      {/* Tab 3: Knowledge Base Tasks */}
      {activeTab === 'kb-tasks' && (
        <KBTaskPanel tasks={tasks} onRefreshTasks={loadData} />
      )}

      {/* Tab 4: Analytics */}
      {activeTab === 'analytics' && (
        <AnalyticsCharts analytics={analytics} />
      )}

      {/* Comprehensive Quality Inspector Drawer Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
            >
              {/* Modal Top Bar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-rose-950 text-red-700 dark:text-rose-400 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#002B49] dark:text-white font-sans">
                      AI Governance Record Details
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500">
                      ID: {selectedItem.id} • Session: {selectedItem.sessionId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreateKBTaskFromItem}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                    title="Convert review into Knowledge Base Improvement Task"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create KB Task</span>
                  </button>

                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                {/* Workflow Governance Control Toolbar */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Priority Selector */}
                    <div>
                      <span className="font-semibold text-slate-500 block mb-1">Priority Level:</span>
                      <div className="flex items-center gap-1">
                        {(['Critical', 'High', 'Medium', 'Low'] as ReviewPriority[]).map((p) => (
                          <button
                            key={p}
                            onClick={() => handleUpdatePriority(selectedItem.id, p)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                              selectedItem.priority === p
                                ? 'bg-[#002B49] text-white border-blue-900'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Root Cause Selector */}
                    <div>
                      <span className="font-semibold text-slate-500 block mb-1">Root Cause Classification:</span>
                      <select
                        value={selectedItem.rootCause}
                        onChange={(e) => handleUpdateRootCause(selectedItem.id, e.target.value as RootCauseCategory)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold text-xs text-slate-900 dark:text-white"
                      >
                        <option value="Missing Document">Missing Document</option>
                        <option value="Outdated Information">Outdated Information</option>
                        <option value="Incorrect Retrieval">Incorrect Retrieval</option>
                        <option value="Prompt Issue">Prompt Issue</option>
                        <option value="Hallucination">Hallucination</option>
                        <option value="Metadata Error">Metadata Error</option>
                        <option value="Duplicate Chunk">Duplicate Chunk</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>

                    {/* Reviewer Assignment */}
                    <div>
                      <span className="font-semibold text-slate-500 block mb-1">Assigned Team:</span>
                      <ReviewerSelector
                        currentReviewer={selectedItem.assignedReviewer}
                        onSelectReviewer={(rev) => handleUpdateReviewer(selectedItem.id, rev)}
                      />
                    </div>
                  </div>

                  {/* Workflow Transitions */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Status Workflow:
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {(['New', 'Assigned', 'Investigating', 'Waiting for KB Update', 'Resolved', 'Closed'] as WorkflowStatus[]).map(
                        (st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateStatus(selectedItem.id, st)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                              selectedItem.status === st
                                ? 'bg-[#002B49] text-white border-blue-900 shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Q&A Text Comparison */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1">
                    <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                      Student Question
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                      "{selectedItem.question}"
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Generated AI Answer
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                      {selectedItem.answer}
                    </p>
                  </div>
                </div>

                {/* AI Recommendation Panel Component */}
                <RecommendationPanel recommendation={selectedItem.aiRecommendation} />

                {/* Tabbed Inspector Sub-Navigation */}
                <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalTab('recommendation')}
                    className={`py-2 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                      activeModalTab === 'recommendation'
                        ? 'border-[#8B0000] text-[#002B49] dark:text-amber-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>Governance Details</span>
                  </button>

                  <button
                    onClick={() => setActiveModalTab('sources')}
                    className={`py-2 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                      activeModalTab === 'sources'
                        ? 'border-[#8B0000] text-[#002B49] dark:text-amber-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Retrieved Sources ({selectedItem.sources?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveModalTab('history')}
                    className={`py-2 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                      activeModalTab === 'history'
                        ? 'border-[#8B0000] text-[#002B49] dark:text-amber-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Conversation Thread</span>
                  </button>

                  <button
                    onClick={() => setActiveModalTab('notes')}
                    className={`py-2 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                      activeModalTab === 'notes'
                        ? 'border-[#8B0000] text-[#002B49] dark:text-amber-400'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Internal Admin Notes</span>
                  </button>
                </div>

                {/* Modal Tab 1: Governance Details & History Timeline */}
                {activeModalTab === 'recommendation' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white">Audit History Timeline</h4>
                      <div className="space-y-2">
                        {selectedItem.historyTimeline?.map((h, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-700 dark:text-slate-300">• {h.action}</span>
                            <span className="text-slate-400 font-mono">{h.timestamp} ({h.actor})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Tab 2: Sources */}
                {activeModalTab === 'sources' && (
                  <div className="space-y-3">
                    {!selectedItem.sources || selectedItem.sources.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No retrieved sources logged for this query.</p>
                    ) : (
                      selectedItem.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[#8B0000] dark:text-amber-400" />
                              {src.source}
                            </span>
                            {src.doc_type && (
                              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                                {src.doc_type}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed">
                            "{src.content_snippet}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Modal Tab 3: Conversation History */}
                {activeModalTab === 'history' && (
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    {sessionMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          msg.role === 'user'
                            ? 'bg-[#002B49] text-white ml-auto max-w-[85%]'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700 mr-auto max-w-[90%]'
                        }`}
                      >
                        <div className="font-bold text-[10px] opacity-75 uppercase">
                          {msg.role === 'user' ? 'Student Prompt' : 'AI Assistant'}
                        </div>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal Tab 4: Internal Admin Notes */}
                {activeModalTab === 'notes' && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Record Governance & Resolution Notes
                    </label>
                    <textarea
                      value={adminNoteText}
                      onChange={(e) => setAdminNoteText(e.target.value)}
                      rows={4}
                      placeholder="e.g., 'Re-ingested 2026 B.Tech Prospectus PDF to fix outdated fee figures.'"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002B49] dark:focus:ring-amber-400 resize-none font-sans custom-scrollbar"
                    />
                    <div className="flex items-center justify-between">
                      {noteSavedMsg ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Governance Note Saved
                        </span>
                      ) : (
                        <span />
                      )}

                      <button
                        onClick={handleSaveNote}
                        disabled={savingNote}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B0000] hover:bg-red-900 text-white text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingNote ? 'Saving Note...' : 'Save Note'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  Logged: {selectedItem.timestamp}
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold transition-colors"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
