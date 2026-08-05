'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlayCircle,
  Trash2,
  X,
  User,
  Mail,
  Tag,
  Calendar,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { StudentInquiry, InquiryStatus, InquiryCounts } from '@/types/inquiry';

export default function AdminStudentInquiriesPage() {
  const [inquiries, setInquiries] = useState<StudentInquiry[]>([]);
  const [counts, setCounts] = useState<InquiryCounts>({
    Pending: 0,
    'In Progress': 0,
    Resolved: 0,
    Closed: 0,
    total: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  // Drawer state
  const [selectedInquiry, setSelectedInquiry] = useState<StudentInquiry | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast(type === 'success' ? { type: 'success', text } : { type: 'error', text });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getAdminInquiries({
        search: search.trim() || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        sort: sortOrder,
      });

      if (res.success) {
        setInquiries(res.inquiries || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err: any) {
      console.error('Failed to fetch inquiries:', err);
      showToast('error', 'Failed to load inquiries from server.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, categoryFilter, sortOrder]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleStatusUpdate = async (inquiryId: number, newStatus: InquiryStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await apiService.updateInquiryStatus(inquiryId, newStatus);
      if (res.success && res.inquiry) {
        showToast('success', `Inquiry ${res.inquiry.reference_id} marked as ${newStatus}.`);
        setSelectedInquiry(res.inquiry);
        fetchInquiries();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteInquiry = async (inquiryId: number, refId: string) => {
    if (!window.confirm(`Are you sure you want to delete inquiry ${refId}?`)) return;

    setIsDeleting(true);
    try {
      const res = await apiService.deleteInquiry(inquiryId);
      if (res.success) {
        showToast('success', `Inquiry ${refId} deleted successfully.`);
        setSelectedInquiry(null);
        fetchInquiries();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete inquiry.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Pending
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <PlayCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Resolved
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <XCircle className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            Closed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
              : 'bg-red-950 border-red-700 text-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-900 dark:text-white">Student Inquiries</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#002B49] dark:text-white tracking-tight">
            Student Inquiry Management System
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Review, track, and manage official student help desk submissions in real time.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Status Metrics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Pending
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
              {counts.Pending}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
              {counts['In Progress']}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Resolved
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
              {counts.Resolved}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              Closed
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
              {counts.Closed}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Reference ID, Name, Email, Category..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
            >
              <option value="All">All Categories</option>
              <option value="B.Tech Admissions 2026-27">Admissions</option>
              <option value="UP Post-Matric Fee Reimbursement">Scholarship</option>
              <option value="Hostel & Mess Services">Hostel & Mess</option>
              <option value="Examinations & Marksheets">Examinations</option>
              <option value="General University Inquiry">General</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="sm:col-span-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries Data Table */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#002B49] dark:text-amber-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading student inquiries...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No student inquiries found.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search query or filter criteria.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Reference ID</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Created At</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {inquiries.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedInquiry(item)}
                >
                  <td className="py-3 px-3 font-mono font-bold text-[#002B49] dark:text-amber-400 whitespace-nowrap">
                    {item.reference_id}
                  </td>
                  <td className="py-3 px-3 font-medium whitespace-nowrap">{item.name}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{item.email}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInquiry(item);
                      }}
                      className="px-2.5 py-1 rounded bg-[#002B49] text-white hover:bg-[#001D33] text-[11px] font-semibold transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Inquiry Detail Drawer Overlay */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl overflow-y-auto flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 bg-[#002B49] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Inquiry Detail Record
                </span>
                <h2 className="text-lg font-mono font-bold">{selectedInquiry.reference_id}</h2>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Status Header */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Current Status:</span>
                <div>{getStatusBadge(selectedInquiry.status)}</div>
              </div>

              {/* Student Metadata */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-[#002B49] dark:text-white uppercase tracking-wider text-[11px]">
                  Student Contact Details
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <User className="w-4 h-4 text-[#8B0000] dark:text-amber-400 shrink-0" />
                    <span className="font-semibold">Full Name:</span>
                    <span>{selectedInquiry.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-[#8B0000] dark:text-amber-400 shrink-0" />
                    <span className="font-semibold">Email:</span>
                    <a href={`mailto:${selectedInquiry.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Tag className="w-4 h-4 text-[#8B0000] dark:text-amber-400 shrink-0" />
                    <span className="font-semibold">Category:</span>
                    <span>{selectedInquiry.category}</span>
                  </div>
                </div>
              </div>

              {/* Full Message */}
              <div className="space-y-2">
                <h3 className="font-bold text-[#002B49] dark:text-white uppercase tracking-wider text-[11px]">
                  Full Inquiry Message
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Timeline */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-[#002B49] dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8B0000] dark:text-amber-400" />
                  <span>Submission Timeline</span>
                </h3>

                <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Submitted At:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {new Date(selectedInquiry.created_at).toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated At:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {new Date(selectedInquiry.updated_at).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-[#002B49] dark:text-white uppercase tracking-wider text-[11px]">
                  Administrative Actions
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleStatusUpdate(selectedInquiry.id, 'In Progress')}
                    disabled={isUpdatingStatus || selectedInquiry.status === 'In Progress'}
                    className="h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-40"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Mark In Progress</span>
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(selectedInquiry.id, 'Resolved')}
                    disabled={isUpdatingStatus || selectedInquiry.status === 'Resolved'}
                    className="h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-40"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(selectedInquiry.id, 'Closed')}
                    disabled={isUpdatingStatus || selectedInquiry.status === 'Closed'}
                    className="h-9 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-40"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Close Inquiry</span>
                  </button>

                  <button
                    onClick={() => handleDeleteInquiry(selectedInquiry.id, selectedInquiry.reference_id)}
                    disabled={isDeleting}
                    className="h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Inquiry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
