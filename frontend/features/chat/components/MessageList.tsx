'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { MessageItem } from './MessageItem';
import { EmptyState } from './EmptyState';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming?: boolean;
  onCopyText: (id: string, text: string) => void;
  copiedId: string | null;
  onSelectPrompt: (prompt: string) => void;
  onRetry?: (question?: string) => void;
  onRegenerate?: () => void;
  sessionId?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  isStreaming,
  onCopyText,
  copiedId,
  onSelectPrompt,
  onRetry,
  onRegenerate,
  sessionId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const userScrolledUpRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    userScrolledUpRef.current = false;
    setShowScrollBottom((prev) => (prev ? false : prev));
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;

      userScrolledUpRef.current = !isNearBottom;
      setShowScrollBottom((prev) => {
        const next = !isNearBottom;
        return prev !== next ? next : prev;
      });
    });
  };

  // Smart auto-scroll: Scroll to bottom only if user hasn't manually scrolled up
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isStreaming]);

  // Show EmptyState ONLY when the active conversation has 0 messages
  const showEmptyState = messages.length === 0;

  const lastAssistantIdx = messages.map((m) => m.role).lastIndexOf('assistant');

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 custom-scrollbar flex flex-col items-center relative bg-slate-50/50 dark:bg-slate-950/50"
    >
      <div className="w-full max-w-3xl space-y-6 sm:space-y-7 flex-1 flex flex-col justify-start">
        {showEmptyState ? (
          <EmptyState onSelectPrompt={onSelectPrompt} />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onCopyText={onCopyText}
                copiedId={copiedId}
                onRetry={onRetry}
                onSelectQuery={onSelectPrompt}
                onRegenerate={onRegenerate}
                isLastMessage={idx === lastAssistantIdx}
                disabled={isLoading || isStreaming}
                sessionId={sessionId}
              />
            ))}
          </AnimatePresence>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Floating Scroll to Bottom Trigger Button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            onClick={() => scrollToBottom(true)}
            className="fixed bottom-24 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 shadow-xl backdrop-blur-md text-xs font-semibold transition-all hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
          >
            <span>Scroll to latest</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#1268D4] dark:text-[#1E88FF]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
