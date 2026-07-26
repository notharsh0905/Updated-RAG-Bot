'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { MessageItem } from './MessageItem';
import { LoadingPlaceholder } from './LoadingPlaceholder';
import { EmptyState } from './EmptyState';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming?: boolean;
  onCopyText: (id: string, text: string) => void;
  copiedId: string | null;
  onSelectPrompt: (prompt: string) => void;
  onRetry?: (question?: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  isStreaming,
  onCopyText,
  copiedId,
  onSelectPrompt,
  onRetry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const userScrolledUpRef = useRef(false);

  const scrollToBottom = useCallback((smooth = true) => {
    userScrolledUpRef.current = false;
    setShowScrollBottom(false);
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;

    userScrolledUpRef.current = !isNearBottom;
    setShowScrollBottom(!isNearBottom);
  };

  // Smart auto-scroll: auto scroll only if user is near bottom
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      scrollToBottom(true);
    }
  }, [messages, isLoading, isStreaming, scrollToBottom]);

  const showEmptyState = messages.length <= 1;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 custom-scrollbar flex flex-col items-center relative"
    >
      <div className="w-full max-w-3xl space-y-6 sm:space-y-7 flex-1 flex flex-col justify-start">
        {showEmptyState ? (
          <EmptyState onSelectPrompt={onSelectPrompt} />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onCopyText={onCopyText}
                copiedId={copiedId}
                onRetry={onRetry}
                onSelectQuery={onSelectPrompt}
                disabled={isLoading || isStreaming}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Loading Placeholder while waiting for initial stream token */}
        {isLoading && !isStreaming && <LoadingPlaceholder />}

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
            className="fixed bottom-24 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 text-slate-200 hover:text-white border border-slate-700/80 shadow-xl backdrop-blur-md text-xs font-semibold transition-all hover:bg-slate-700 active:scale-95"
          >
            <span>Scroll to latest</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
