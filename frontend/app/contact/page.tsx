'use client';

import React, { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Send, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'B.Tech Admissions 2026-27',
    message: '',
  });

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side Validation
    const nameTrimmed = formData.name.trim();
    const emailTrimmed = formData.email.trim();
    const messageTrimmed = formData.message.trim();

    if (!nameTrimmed) {
      setErrorMessage('Full Name is required.');
      showToast('error', 'Full Name is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      setErrorMessage('Please enter a valid email address.');
      showToast('error', 'Please enter a valid email address.');
      return;
    }

    if (!formData.category) {
      setErrorMessage('Please select an inquiry category.');
      showToast('error', 'Please select an inquiry category.');
      return;
    }

    if (!messageTrimmed || messageTrimmed.length < 20) {
      setErrorMessage('Message must be at least 20 characters long.');
      showToast('error', 'Message must be at least 20 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiService.submitInquiry({
        name: nameTrimmed,
        email: emailTrimmed,
        category: formData.category,
        message: messageTrimmed,
      });

      if (res.success && res.reference_id) {
        setSubmittedRefId(res.reference_id);
        showToast('success', `Inquiry submitted! Reference ID: ${res.reference_id}`);
        setFormData({
          name: '',
          email: '',
          category: 'B.Tech Admissions 2026-27',
          message: '',
        });
      } else {
        setErrorMessage('Failed to submit inquiry. Please try again.');
        showToast('error', 'Failed to submit inquiry.');
      }
    } catch (err: any) {
      const detail = err.response?.data?.message || err.response?.data?.detail || 'An unexpected error occurred.';
      setErrorMessage(detail);
      showToast('error', detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-bottom-4 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
              : 'bg-red-950 border-red-700 text-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Title */}
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#002B49] dark:text-white tracking-tight">
          Official University Contact Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Chhatrapati Shahu Ji Maharaj University (CSJMU) & UIET Kanpur Administrative Helpdesk
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Direct Helplines & Department Emails */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#002B49] dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
              Campus Contact Info
            </h2>

            <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#8B0000] dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-white">Campus Location:</strong>
                  <span>CSJMU Campus, Kalyanpur, Kanpur, Uttar Pradesh - 208024</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#8B0000] dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-white">Admissions Inquiry Email:</strong>
                  <span>admission@csjmu.ac.in</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#8B0000] dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-white">University Helpline:</strong>
                  <span>+91 0512-2580044 / 2581261</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#8B0000] dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-white">Office Hours:</strong>
                  <span>Monday - Saturday: 10:00 AM to 5:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#002B49] dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Verification Note</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              All official admission notices and fee schedules are published exclusively on csjmu.ac.in. Always verify credentials before making transactions.
            </p>
          </div>
        </div>

        {/* Right Column: Inquiry Submission Form & Success Card */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#002B49] dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
              Submit Official Student Inquiry
            </h2>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Submission Error</strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Success Submission Card */}
            {submittedRefId ? (
              <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                    Your inquiry has been submitted successfully.
                  </p>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 max-w-xs mx-auto space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                      Reference ID:
                    </span>
                    <span className="text-base font-mono font-bold text-[#002B49] dark:text-amber-400">
                      {submittedRefId}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Our university office will review your request shortly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmittedRefId(null)}
                  className="px-4 py-2 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. student@gmail.com"
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Category / Department *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
                  >
                    <option value="B.Tech Admissions 2026-27">B.Tech Admissions 2026-27</option>
                    <option value="UP Post-Matric Fee Reimbursement">UP Post-Matric Fee Reimbursement</option>
                    <option value="Hostel & Mess Services">Hostel & Mess Services</option>
                    <option value="Examinations & Marksheets">Examinations & Marksheets</option>
                    <option value="General University Inquiry">General University Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Message Details *
                    </label>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Min 20 characters ({formData.message.length}/2000)
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry clearly (at least 20 characters)..."
                    className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Submit Form to University Office</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
