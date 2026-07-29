'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useConversationStore } from '@/store/useConversationStore';
import { apiService } from '@/services/api';
import { ChatMessage } from '@/types/chat';
import { ChatLayout } from './components/ChatLayout';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';

const DEFAULT_SMART_SUGGESTIONS = [
  'What is the admission procedure for B.Tech CSE at UIET?',
  'What scholarships and UP fee waivers are offered?',
  'What is the highest package in UIET placements?',
  'What facilities exist in the campus hostels?',
];

export const ChatWindow: React.FC = () => {
  // UI-only Transient State
  const {
    pendingQuestion,
    setPendingQuestion,
    isLoading,
    setIsLoading,
    isStreaming,
    setIsStreaming,
    resetUIState,
  } = useChatStore();

  // Permanent Conversation State & Granular Message Actions
  const {
    activeId,
    conversations,
    createConversation,
    addMessageToActive,
    appendTokenToActive,
    updateActiveMessage,
    finishActiveMessageStreaming,
    removeMessageFromActive,
  } = useConversationStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Derive active messages directly from source of truth - ZERO passive sync useEffects
  const activeConv = conversations.find((c) => c.id === activeId);
  const messages: ChatMessage[] = activeConv?.messages || [];

  // Execution locks to prevent duplicate submissions
  const isSubmittingRef = useRef(false);
  const processedPendingRef = useRef<string | null>(null);

  const handleExecuteQuery = useCallback(
    async (queryText: string) => {
      const trimmed = queryText.trim();
      if (!trimmed || isLoading || isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setIsLoading(true);
      setIsStreaming(false);

      // Add user prompt message to active conversation
      const userMsgId = crypto.randomUUID();
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addMessageToActive(userMsg);

      // Create initial target assistant message in active conversation
      const assistantMsgId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        isStreaming: true,
        rawQuestion: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addMessageToActive(assistantMsg);

      // SSE Stream Execution with Guaranteed Granular Mutation & Completion
      await apiService.sendQueryStream(
        trimmed,
        activeId || 'default-session',
        (token: string) => {
          setIsStreaming(true);
          appendTokenToActive(assistantMsgId, token);
        },
        () => {
          // Stream completion handler - Commit message, stop cursor & attach suggestions
          finishActiveMessageStreaming(assistantMsgId, DEFAULT_SMART_SUGGESTIONS);
          setIsStreaming(false);
          setIsLoading(false);
          isSubmittingRef.current = false;
          processedPendingRef.current = null;
        },
        async () => {
          // Stream error handler - Fallback to standard POST /query
          try {
            const res = await apiService.sendQuery(trimmed, activeId || 'default-session');
            updateActiveMessage(assistantMsgId, {
              content: res.answer,
              sources: res.sources,
              suggestions: res.suggested_objects || res.suggested_questions || DEFAULT_SMART_SUGGESTIONS,
              isStreaming: false,
              isError: false,
            });
          } catch (fallbackErr) {
            updateActiveMessage(assistantMsgId, {
              isError: true,
              isStreaming: false,
              content:
                'Official CSJMU campus knowledge records are currently updating. Verify connection and click retry below.',
            });
          } finally {
            setIsStreaming(false);
            setIsLoading(false);
            isSubmittingRef.current = false;
            processedPendingRef.current = null;
          }
        }
      );
    },
    [
      activeId,
      isLoading,
      setIsLoading,
      setIsStreaming,
      addMessageToActive,
      appendTokenToActive,
      updateActiveMessage,
      finishActiveMessageStreaming,
    ]
  );

  // Single-execution effect for pending questions passed from other pages
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

  const handleRetry = (retryQuestion?: string) => {
    if (retryQuestion) {
      handleExecuteQuery(retryQuestion);
    }
  };

  const handleRegenerate = useCallback(() => {
    if (isLoading || isSubmittingRef.current || messages.length === 0) return;

    const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
    const userMessages = messages.filter((m) => m.role === 'user');
    const lastUserMsg = userMessages[userMessages.length - 1];

    if (lastAssistantMsg && lastUserMsg) {
      removeMessageFromActive(lastAssistantMsg.id);
      handleExecuteQuery(lastUserMsg.content);
    }
  }, [isLoading, messages, removeMessageFromActive, handleExecuteQuery]);

  const handleNewChat = () => {
    resetUIState();
    createConversation();
  };

  return (
    <ChatLayout
      onNewChat={handleNewChat}
      onSelectQuery={handleExecuteQuery}
    >
      <MessageList
        messages={messages}
        isLoading={isLoading}
        isStreaming={isStreaming}
        onCopyText={handleCopyText}
        copiedId={copiedId}
        onSelectPrompt={handleExecuteQuery}
        onRetry={handleRetry}
        onRegenerate={handleRegenerate}
        sessionId={activeId || 'default-session'}
      />
      <ChatInput
        onSubmit={handleExecuteQuery}
        isLoading={isLoading || isStreaming}
      />
    </ChatLayout>
  );
};
