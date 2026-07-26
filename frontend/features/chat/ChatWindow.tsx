'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useConversationStore } from '@/store/useConversationStore';
import { apiService } from '@/services/api';
import { ChatMessage } from '@/types/chat';
import { ChatLayout } from './components/ChatLayout';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';

export const ChatWindow: React.FC = () => {
  const {
    messages,
    addMessage,
    updateMessageContent,
    updateMessageState,
    removeMessage,
    pendingQuestion,
    setPendingQuestion,
    isLoading,
    setIsLoading,
    resetChat,
  } = useChatStore();

  const {
    activeId,
    createConversation,
    updateConversationMessages,
    conversations,
  } = useConversationStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Execution locks to prevent duplicate submissions
  const isSubmittingRef = useRef(false);
  const processedPendingRef = useRef<string | null>(null);

  // Keep conversation store in sync when messages change
  useEffect(() => {
    if (messages.length > 0 && activeId) {
      const userMsg = messages.find((m) => m.role === 'user');
      updateConversationMessages(activeId, messages, userMsg?.content);
    }
  }, [messages, activeId, updateConversationMessages]);

  const handleExecuteQuery = useCallback(
    async (queryText: string) => {
      const trimmed = queryText.trim();
      if (!trimmed || isLoading || isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setIsLoading(true);
      setIsStreaming(false);

      // Add user prompt message
      const userMsgId = crypto.randomUUID();
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addMessage(userMsg);

      // Create initial assistant target message
      const assistantMsgId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        isStreaming: true,
        rawQuestion: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      addMessage(assistantMsg);

      let accumulatedContent = '';

      // SSE Stream Execution with Fallback
      await apiService.sendQueryStream(
        trimmed,
        activeId || 'default-session',
        (token: string) => {
          accumulatedContent += token;
          setIsStreaming(true);
          updateMessageContent(assistantMsgId, accumulatedContent, true);
        },
        () => {
          // Stream completion handler
          updateMessageState(assistantMsgId, { isStreaming: false });
          setIsStreaming(false);
          setIsLoading(false);
          isSubmittingRef.current = false;
          processedPendingRef.current = null;
        },
        async () => {
          // Stream error handler - Fallback to standard POST /query
          try {
            const res = await apiService.sendQuery(trimmed, activeId || 'default-session');
            updateMessageContent(assistantMsgId, res.answer, false);
            updateMessageState(assistantMsgId, {
              sources: res.sources,
              suggestions: res.suggested_objects || res.suggested_questions,
              isStreaming: false,
              isError: false,
            });
          } catch (fallbackErr) {
            updateMessageState(assistantMsgId, {
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
    [activeId, addMessage, isLoading, setIsLoading, updateMessageContent, updateMessageState]
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
      removeMessage(lastAssistantMsg.id);
      handleExecuteQuery(lastUserMsg.content);
    }
  }, [isLoading, messages, removeMessage, handleExecuteQuery]);

  const handleNewChat = () => {
    resetChat();
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
