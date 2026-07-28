'use client';

import React, { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'admissions', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
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

        {/* Right Column: Inquiry Submission Form */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#002B49] dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
              Submit Official Student Inquiry
            </h2>

            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  Inquiry Submitted Successfully
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto">
                  Thank you. Your message has been logged with the university helpdesk. An officer will review your request.
                </p>
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
                    Category / Department
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
                  >
                    <option value="admissions">B.Tech Admissions 2026-27</option>
                    <option value="scholarship">UP Post-Matric Fee Reimbursement</option>
                    <option value="hostel">Hostel & Mess Services</option>
                    <option value="examinations">Examinations & Marksheets</option>
                    <option value="other">General University Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Message Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry clearly..."
                    className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#002B49] dark:focus:ring-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-10 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
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
