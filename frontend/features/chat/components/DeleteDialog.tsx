'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface DeleteDialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  title,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

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
          aria-label="Delete Conversation"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#8B0000] dark:text-rose-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">Delete Conversation</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white font-semibold font-mono">"{title}"</strong>? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#8B0000] hover:bg-red-900 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
