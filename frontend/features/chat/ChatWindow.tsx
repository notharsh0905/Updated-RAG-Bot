'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Bot,
  User,
  GraduationCap,
  BookOpen,
  DollarSign,
  Briefcase,
  Home as HomeIcon,
  Building,
  Award,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { apiService } from '@/services/api';
import { SuggestionChips } from './SuggestionChips';
import { ChatMessage } from '@/types/chat';

export const ChatWindow: React.FC = () => {
  const {
    sessionId,
    messages,
    addMessage,
    pendingQuestion,
    setPendingQuestion,
    isLoading,
    setIsLoading,
  } = useChatStore();

  const [inputQuery, setInputQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackLogged, setFeedbackLogged] = useState<Record<string, number>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  // Execution locks to prevent duplicate submissions
  const isSubmittingRef = useRef(false);
  const processedPendingRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Bulletproof single-execution effect for pending question from store
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
  }, [pendingQuestion, isLoading]);

  const handleExecuteQuery = async (queryText: string) => {
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
    setInputQuery('');

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
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = async (messageId: string, question: string, answer: string, rating: number) => {
    try {
      await apiService.sendFeedback({
        session_id: sessionId,
        question,
        answer,
        rating,
      });
      setFeedbackLogged((prev) => ({ ...prev, [messageId]: rating }));
    } catch (e) {
      // fallback
    }
  };

  const heroCategories = [
    { title: '📝 Admissions', query: 'What is the admission procedure for B.Tech CSE at UIET?' },
    { title: '💰 Fees & Aid', query: 'What scholarships and fee reimbursement schemes are available?' },
    { title: '💼 Placements', query: 'What is the highest placement package and top recruiters at UIET?' },
    { title: '🏠 Hostels', query: 'What hostel facilities, mess, rules, and curfew timings exist?' },
    { title: '🏫 Departments', query: 'What engineering departments and programs exist under UIET?' },
    { title: '👨‍🏫 Faculty', query: 'Tell me about the faculty background and mentorship at UIET.' },
    { title: '🚀 Innovation', query: 'What facilities exist at the Innovation Center and PEZ printing?' },
    { title: '🔬 Research', query: 'What research facilities and NVIDIA DGX H100 supercomputer exist at UIET?' },
    { title: '🏆 GATE Results', query: 'What are the recent GATE achievements of UIET students?' },
    { title: '🏊 Facilities', query: 'What central library, sports complex, and medical facilities exist on campus?' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* Scrollable Conversation Canvas */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {/* Hero Banner Header */}
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-[#002B49] via-slate-900 to-[#8B0000] p-6 text-white shadow-xl border-2 border-[#D4AF37]/40 mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#8B0000] border border-[#D4AF37] text-white flex items-center justify-center font-bold shrink-0">
                CSJMU
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-serif">
                  UIET Kanpur — AI Campus Assistant Portal
                </h1>
                <p className="text-xs text-amber-300 font-semibold">
                  Official Knowledge Engine • Chhatrapati Shahu Ji Maharaj University
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl mt-2">
              Ask any question regarding B.Tech Admissions 2026-27, UP Post-Matric Fee Reimbursement, Placements, Supercomputing Facilities, Hostels, and PEZ Printing.
            </p>

            {/* Quick Action Categories */}
            <div className="mt-5">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                <span className="uni-bullet">➲</span>
                <span>Quick Service Directory</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {heroCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteQuery(cat.query)}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-[#A51C30] border border-white/20 text-white text-xs font-semibold transition-all text-left truncate flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <span className="uni-bullet text-amber-300">➲</span>
                    <span className="truncate">{cat.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Message Stream */}
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const previousUserQuery = idx > 0 && messages[idx - 1]?.role === 'user' ? messages[idx - 1].content : '';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-xl bg-[#002B49] text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div className={`max-w-[88%] sm:max-w-[82%] space-y-2 ${isUser ? 'order-1' : 'order-2'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3.5 shadow-sm text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#A51C30] text-white rounded-br-none font-medium'
                        : 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border-2 border-slate-200/90 dark:border-slate-700/80 rounded-bl-none'
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>

                    {!isUser && (
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-400">
                        <span className="text-[11px] font-semibold text-slate-500">{msg.timestamp}</span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyText(msg.id, msg.content)}
                            className="p-1 hover:text-[#002B49] dark:hover:text-white transition-colors"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleFeedback(msg.id, previousUserQuery, msg.content, 1)}
                            className={`p-1 hover:text-emerald-600 transition-colors ${feedbackLogged[msg.id] === 1 ? 'text-emerald-500' : ''}`}
                            title="Thumbs Up"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleFeedback(msg.id, previousUserQuery, msg.content, -1)}
                            className={`p-1 hover:text-rose-600 transition-colors ${feedbackLogged[msg.id] === -1 ? 'text-rose-500' : ''}`}
                            title="Thumbs Down"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Short Clickable Suggestion Chips */}
                  {!isUser && msg.suggestions && (
                    <SuggestionChips
                      suggestions={msg.suggestions}
                      onSelect={(fullQ) => handleExecuteQuery(fullQ)}
                    />
                  )}
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white flex items-center justify-center shrink-0 shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 items-center text-slate-600 dark:text-slate-300 text-xs py-2">
            <div className="w-8 h-8 rounded-xl bg-[#002B49] text-amber-400 flex items-center justify-center animate-spin">
              <Loader2 className="w-4 h-4" />
            </div>
            <span>Processing official CSJMU records & generating answer...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <div className="py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteQuery(inputQuery);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask any official question about CSJMU or UIET (e.g. 'How much scholarship do SC students receive?')..."
            className="w-full h-12 pl-4 pr-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A51C30] text-sm text-slate-900 dark:text-white shadow-sm transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="absolute right-2 w-9 h-9 rounded-xl bg-[#A51C30] hover:bg-[#8B0000] disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-sm active:scale-95"
            title="Send Query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
          Official CSJMU & UIET AI Assistant • All responses are strictly grounded in official university records.
        </p>
      </div>
    </div>
  );
};
