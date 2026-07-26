'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Paperclip, Globe, Command } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [value]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-4 pt-2 shrink-0 z-20">
      <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-2.5 transition-all focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500/50">
        {/* Dynamic Multi-line Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask any question about CSJMU or UIET (e.g. 'What is the B.Tech CSE fee structure?')..."
          disabled={isLoading}
          className="w-full bg-transparent border-0 resize-none text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 text-sm leading-relaxed px-2 py-1 max-h-40 custom-scrollbar font-sans"
        />

        {/* Bottom Toolbar & Submit Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 px-1 mt-1">
          {/* Left Accessory Indicators (Ready for Future Features) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-400 border border-slate-700/50">
              <Sparkles className="w-3 h-3 text-amber-400" /> Grounded RAG
            </span>
            <span className="text-[11px] text-slate-500 hidden md:inline">
              Press <kbd className="font-mono text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">Enter↵</kbd> to send, <kbd className="font-mono text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">Shift+Enter</kbd> for line break
            </span>
          </div>

          {/* Right Action Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!value.trim() || isLoading}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-[#A51C30] to-[#8B0000] hover:from-[#C0392B] hover:to-[#A51C30] disabled:opacity-30 disabled:hover:from-[#A51C30] disabled:hover:to-[#8B0000] text-white transition-all shadow-md active:scale-95 shrink-0"
            title="Send query"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-caption */}
      <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
        CSJMU Kanpur AI Assistant v2.5 • Verified responses grounded in official university documents.
      </p>
    </div>
  );
};
