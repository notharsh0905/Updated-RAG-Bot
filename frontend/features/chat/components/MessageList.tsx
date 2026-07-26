'use client';

import React, { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/types/chat';
import { MessageItem } from './MessageItem';
import { LoadingPlaceholder } from './LoadingPlaceholder';
import { EmptyState } from './EmptyState';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onCopyText: (id: string, text: string) => void;
  copiedId: string | null;
  onSelectPrompt: (prompt: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onCopyText,
  copiedId,
  onSelectPrompt,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const showEmptyState = messages.length <= 1;

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 custom-scrollbar flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6 flex-1 flex flex-col justify-start">
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
              />
            ))}
          </AnimatePresence>
        )}

        {isLoading && <LoadingPlaceholder />}

        <div ref={bottomRef} className="h-2" />
      </div>
    </div>
  );
};
