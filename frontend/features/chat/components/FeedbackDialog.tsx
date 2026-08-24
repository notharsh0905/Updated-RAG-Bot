'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ThumbsDown, Send, Loader2, AlertCircle } from 'lucide-react';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, comments: string) => Promise<void>;
  question?: string;
}

const REASONS = [
  'Incorrect Information',
  'Outdated Record',
  "Didn't answer my question",
  'Poor Formatting',
  'Hallucinated Detail',
  'Other',
];

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  question,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REASONS[0]);
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit(selectedReason, commentText);
      onClose();
    } catch (err: any) {
      setErrorMsg('Failed to record feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-dialog-title"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-rose-950/60 border border-red-200 dark:border-rose-800/80 text-red-600 dark:text-rose-400 flex items-center justify-center">
                <ThumbsDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">
                  Provide Feedback
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Help improve official CSJMU AI records
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reason Selection Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                What went wrong with this response?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map((reason) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className={`p-2 rounded-xl text-xs font-medium text-left transition-all border ${
                        isSelected
                          ? 'bg-red-50 dark:bg-rose-950/60 border-red-400 dark:border-rose-700 text-red-700 dark:text-rose-200 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {reason}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Comment Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Additional Details (Optional)
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder="Tell us what you expected..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-red-600 dark:focus:ring-rose-700 resize-none font-sans custom-scrollbar"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-rose-400 bg-red-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-red-200 dark:border-rose-900/60">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Footer Submit Button */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-900">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1268D4] hover:bg-red-900 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
