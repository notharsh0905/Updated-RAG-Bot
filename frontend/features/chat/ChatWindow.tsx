'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { apiService } from '@/services/api';
import { ChatMessage } from '@/types/chat';
import { ChatLayout } from './components/ChatLayout';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';

export const ChatWindow: React.FC = () => {
  const {
    sessionId,
    messages,
    addMessage,
    pendingQuestion,
    setPendingQuestion,
    isLoading,
    setIsLoading,
    resetChat,
  } = useChatStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Execution locks to prevent duplicate submissions
  const isSubmittingRef = useRef(false);
  const processedPendingRef = useRef<string | null>(null);

  const handleExecuteQuery = useCallback(
    async (queryText: string) => {
      const trimmed = queryText.trim();
      if (!trimmed || isLoading || isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setIsLoading(true);

      const userMsgId = crypto.randomUUID();
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      addMessage(userMsg);

      try {
        const res = await apiService.sendQuery(trimmed, sessionId);
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: res.answer,
          sources: res.sources,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        addMessage(assistantMsg);
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Official university records are currently being updated. Please try again shortly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        addMessage(errorMsg);
      } finally {
        setIsLoading(false);
        isSubmittingRef.current = false;
        processedPendingRef.current = null;
      }
    },
    [addMessage, isLoading, setIsLoading, sessionId]
  );

  // Single-execution effect for pending questions passed from other pages/sidebar
  useEffect(() => {
    if (
      pendingQuestion &&
      !isLoading &&
      !isSubmittingRef.current &&
      processedPendingRef.current !== pendingQuestion
    ) {
      const q = pendingQuestion;
      processedPendingRef.current = q;
      setPendingQuestion(null);
      handleExecuteQuery(q);
    }
  }, [pendingQuestion, isLoading, setPendingQuestion, handleExecuteQuery]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ChatLayout
      onNewChat={resetChat}
      onSelectQuery={handleExecuteQuery}
    >
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onCopyText={handleCopyText}
        copiedId={copiedId}
        onSelectPrompt={handleExecuteQuery}
      />
      <ChatInput
        onSubmit={handleExecuteQuery}
        isLoading={isLoading}
      />
    </ChatLayout>
  );
};
