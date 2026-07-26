'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/types/chat';

interface MessageItemProps {
  message: ChatMessage;
  onCopyText: (id: string, text: string) => void;
  copiedId: string | null;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onCopyText,
  copiedId,
}) => {
  const isUser = message.role === 'user';
  const isCopied = copiedId === message.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} w-full group`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#002B49] via-slate-900 to-[#8B0000] text-amber-300 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 shadow-md mt-0.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
      )}

      {/* Message Body Container */}
      <div className={`space-y-1.5 ${isUser ? 'max-w-[85%] sm:max-w-[78%]' : 'max-w-[90%] sm:max-w-[85%]'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all ${
            isUser
              ? 'bg-gradient-to-r from-[#A51C30] to-[#8B0000] text-white rounded-br-xs font-medium'
              : 'bg-slate-800/80 border border-slate-700/80 text-slate-100 rounded-bl-xs'
          }`}
        >
          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Action & Metadata Footer for Assistant Message */}
          {!isUser && (
            <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-700/50 text-xs text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">
                {message.timestamp}
              </span>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onCopyText(message.id, message.content)}
                  className="p-1 hover:text-white hover:bg-slate-700/60 rounded transition-colors"
                  title="Copy response"
                >
                  {isCopied ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-700 text-slate-200 border border-slate-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
};
