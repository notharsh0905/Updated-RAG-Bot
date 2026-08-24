'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, X, Check } from 'lucide-react';

interface RenameDialogProps {
  isOpen: boolean;
  initialTitle: string;
  onClose: () => void;
  onSave: (newTitle: string) => void;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({
  isOpen,
  initialTitle,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed) {
      onSave(trimmed);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onKeyDown={handleKeyDown}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Rename Conversation"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#1268D4] dark:text-[#1E88FF]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">Rename Conversation</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              placeholder="Enter conversation title..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#002B49] dark:focus:ring-[#1268D4] font-sans"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-900">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-[#002B49] hover:bg-[#001D33] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
