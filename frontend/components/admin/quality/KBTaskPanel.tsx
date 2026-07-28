'use client';

import React, { useState } from 'react';
import { KBImprovementTask, ReviewerTeam, ReviewPriority } from '@/types/admin';
import { PriorityBadge } from './PriorityBadge';
import { CheckCircle2, Clock, Plus, Calendar, AlertCircle } from 'lucide-react';
import { apiService } from '@/services/api';

interface KBTaskPanelProps {
  tasks: KBImprovementTask[];
  onRefreshTasks: () => void;
}

export const KBTaskPanel: React.FC<KBTaskPanelProps> = ({ tasks, onRefreshTasks }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    problemSummary: '',
    suggestedFix: '',
    requiredDocument: '',
    assignedTeam: 'Knowledge Base Team' as ReviewerTeam,
    priority: 'High' as ReviewPriority,
    dueDate: '',
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.suggestedFix) return;

    await apiService.createKBTask({
      reviewId: `manual-${Date.now()}`,
      question: formData.question,
      problemSummary: formData.problemSummary || 'Knowledge base update required.',
      suggestedFix: formData.suggestedFix,
      requiredDocument: formData.requiredDocument || 'University Prospectus PDF',
      assignedTeam: formData.assignedTeam,
      priority: formData.priority,
      status: 'Open',
      dueDate: formData.dueDate || undefined,
    });

    setShowCreateModal(false);
    setFormData({
      question: '',
      problemSummary: '',
      suggestedFix: '',
      requiredDocument: '',
      assignedTeam: 'Knowledge Base Team',
      priority: 'High',
      dueDate: '',
    });
    onRefreshTasks();
  };

  const handleStatusChange = async (id: string, status: 'Open' | 'In Progress' | 'Completed') => {
    await apiService.updateKBTaskStatus(id, status);
    onRefreshTasks();
  };

  const getTaskStatusBadge = (status: 'Open' | 'In Progress' | 'Completed') => {
    switch (status) {
      case 'Open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <AlertCircle className="w-3 h-3" /> In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Create CTA */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#002B49] dark:text-white">
            Knowledge Base Improvement Tasks
          </h3>
          <p className="text-xs text-slate-500">
            Track PDF re-indexing, prompt tuning, and document update tasks assigned to department teams.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Create KB Improvement Task</span>
        </button>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <PriorityBadge priority={task.priority} />
                {getTaskStatusBadge(task.status)}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                  "{task.question}"
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">Fix:</strong> {task.suggestedFix}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-500 font-semibold">
                  Required Document: <span className="font-mono text-[#8B0000] dark:text-amber-400 font-bold">{task.requiredDocument}</span>
                </div>
                <div className="text-slate-500 font-semibold">
                  Assigned Team: <span className="text-slate-900 dark:text-white font-bold">{task.assignedTeam}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              {task.dueDate ? (
                <span className="text-slate-500 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-amber-500" /> Due: {task.dueDate}
                </span>
              ) : (
                <span className="text-slate-400 font-mono">No Due Date</span>
              )}

              {/* Status Selector */}
              <div className="flex items-center gap-1">
                {(['Open', 'In Progress', 'Completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(task.id, st)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      task.status === st
                        ? 'bg-[#002B49] text-white border-blue-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <h3 className="text-sm font-bold text-[#002B49] dark:text-white">
              Create Knowledge Base Improvement Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Question *</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g., What is the 2026 hostel fee?"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Suggested Fix *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.suggestedFix}
                  onChange={(e) => setFormData({ ...formData, suggestedFix: e.target.value })}
                  placeholder="Describe required knowledge update..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Required Document</label>
                  <input
                    type="text"
                    value={formData.requiredDocument}
                    onChange={(e) => setFormData({ ...formData, requiredDocument: e.target.value })}
                    placeholder="e.g. CSJMU_Hostel_Fee_2026.pdf"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assigned Team</label>
                  <select
                    value={formData.assignedTeam}
                    onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:outline-none font-semibold"
                  >
                    <option value="Admission Cell">Admission Cell</option>
                    <option value="IT Cell">IT Cell</option>
                    <option value="Knowledge Base Team">Knowledge Base Team</option>
                    <option value="Registrar Office">Registrar Office</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002B49] text-white rounded-xl font-bold shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
