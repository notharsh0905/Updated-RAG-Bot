'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { CodeBlock } from './CodeBlock';
import { ErrorMessage } from './ErrorMessage';
import { SourceSection } from './SourceSection';
import { CitationBadge } from './CitationBadge';
import { SuggestionSection } from './SuggestionSection';
import { MessageActions } from './MessageActions';

interface MessageItemProps {
  message: ChatMessage;
  onCopyText: (id: string, text: string) => void;
  copiedId: string | null;
  onRetry?: (question?: string) => void;
  onSelectQuery?: (query: string) => void;
  onRegenerate?: () => void;
  isLastMessage?: boolean;
  disabled?: boolean;
  sessionId?: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onCopyText,
  copiedId,
  onRetry,
  onSelectQuery,
  onRegenerate,
  isLastMessage,
  disabled,
  sessionId = 'default-session',
}) => {
  const isUser = message.role === 'user';
  const isCopied = copiedId === message.id;
  const isAssistantLoading = !isUser && message.content === '';

  // Render Error Message Card if API call failed
  if (message.isError) {
    return (
      <div className="w-full py-2">
        <ErrorMessage
          onRetry={() => onRetry && onRetry(message.rawQuestion)}
          errorText={message.content}
          question={message.rawQuestion}
        />
      </div>
    );
  }

  // Parse inline citations like [1], [2] into interactive CitationBadges recursively
  const renderChildrenWithCitations = (children: React.ReactNode): React.ReactNode => {
    if (typeof children === 'string') {
      const parts = children.split(/(\[\d+\])/g);
      return parts.map((part, idx) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const citationIdx = parseInt(match[1], 10);
          const sourceObj = message.sources ? message.sources[citationIdx - 1] : null;
          return (
            <CitationBadge
              key={idx}
              index={citationIdx}
              messageId={message.id}
              source={sourceObj}
            />
          );
        }
        return part;
      });
    }

    if (Array.isArray(children)) {
      return React.Children.map(children, (child) => renderChildrenWithCitations(child));
    }

    if (React.isValidElement(children)) {
      const childProps = children.props as { children?: React.ReactNode };
      if (childProps && childProps.children) {
        return React.cloneElement(
          children,
          { ...childProps },
          renderChildrenWithCitations(childProps.children)
        );
      }
    }

    return children;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className="flex gap-3 sm:gap-4 w-full group items-start"
    >
      {/* Left Avatar Column: Assistant Seal Avatar if Assistant; Invisible Spacer if User */}
      {!isUser ? (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 bg-white p-0.5 shrink-0 shadow-xs mt-1">
          <img
            src="/images/csjmu-seal-logo.jpg"
            alt="CSJMU Official Assistant"
            className="w-full h-full object-contain rounded-full"
          />
        </div>
      ) : (
        <div className="w-8 h-8 shrink-0 opacity-0 pointer-events-none mt-1 aria-hidden" aria-hidden="true" />
      )}

      {/* Message Content Enclosure */}
      <div className={`space-y-1.5 flex-1 min-w-0 ${isUser ? 'flex justify-end' : 'max-w-[92%] sm:max-w-3xl'}`}>
        <div
          className={`rounded-2xl shadow-xs transition-all ${isUser
              ? 'bg-[#002B49] text-white dark:bg-[#002B49] dark:text-white rounded-tr-xs px-5 py-3.5 sm:px-6 sm:py-4 border border-blue-900/50 max-w-full sm:max-w-2xl'
              : 'bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-slate-100 rounded-tl-xs p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700/80'
            }`}
        >
          {/* User Message View */}
          {isUser ? (
            <div>
              <p className="text-sm sm:text-base font-medium leading-relaxed font-sans text-white tracking-wide break-words">
                {message.content}
              </p>
              <span className="text-[10px] text-blue-200/80 font-mono mt-1.5 text-right block">
                {message.timestamp}
              </span>
            </div>
          ) : (
            /* Assistant Message View: Inline Skeleton or Streamed Content */
            <div>
              {isAssistantLoading ? (
                /* Professional Inline Skeleton Loading State */
                <div className="space-y-3 py-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8B0000] dark:text-amber-400">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-[#8B0000] dark:text-amber-400 shrink-0" />
                    <span>Synthesizing official CSJMU records...</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="h-3.5 bg-slate-200/70 dark:bg-slate-800/70 rounded-full animate-pulse w-3/4" />
                    <div className="h-3.5 bg-slate-200/70 dark:bg-slate-800/70 rounded-full animate-pulse w-full" />
                    <div className="h-3.5 bg-slate-200/70 dark:bg-slate-800/70 rounded-full animate-pulse w-5/6" />
                  </div>
                </div>
              ) : (
                /* Markdown Streamed / Finalized Content Area */
                <div className="text-[14px] sm:text-[15px] leading-relaxed font-sans relative">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');

                        if (!inline && (match || codeString.includes('\n'))) {
                          return (
                            <CodeBlock
                              language={match ? match[1] : 'text'}
                              code={codeString}
                            />
                          );
                        }

                        return (
                          <code
                            className="bg-slate-200/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/60 text-[#8B0000] dark:text-amber-300 font-mono text-[12px] px-1.5 py-0.5 rounded-md font-medium"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      pre({ children }: any) {
                        return <>{children}</>;
                      },
                      h1: ({ children }) => (
                        <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#002B49] dark:text-white tracking-tight mt-6 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                          {renderChildrenWithCitations(children)}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg sm:text-xl font-bold font-serif text-[#002B49] dark:text-white tracking-tight mt-5 mb-2.5">
                          {renderChildrenWithCitations(children)}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 mt-4 mb-2">
                          {renderChildrenWithCitations(children)}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-sm sm:text-base font-semibold text-[#8B0000] dark:text-amber-400 mt-3.5 mb-1.5">
                          {renderChildrenWithCitations(children)}
                        </h4>
                      ),
                      h5: ({ children }) => (
                        <h5 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mt-3 mb-1.5">
                          {renderChildrenWithCitations(children)}
                        </h5>
                      ),
                      h6: ({ children }) => (
                        <h6 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 mb-1">
                          {renderChildrenWithCitations(children)}
                        </h6>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-slate-900 dark:text-white">
                          {renderChildrenWithCitations(children)}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-slate-800 dark:text-slate-200">
                          {renderChildrenWithCitations(children)}
                        </em>
                      ),
                      p: ({ children }) => (
                        <p className="text-[14px] sm:text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 mb-4 last:mb-0 font-normal">
                          {renderChildrenWithCitations(children)}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-2 my-3 pl-6 list-disc marker:text-[#8B0000] dark:marker:text-amber-400 text-[14px] sm:text-[15px] text-slate-800 dark:text-slate-200">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="space-y-2 my-3 pl-6 list-decimal marker:text-[#8B0000] dark:marker:text-amber-400 font-semibold text-[14px] sm:text-[15px] text-slate-800 dark:text-slate-200">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed pl-1">{renderChildrenWithCitations(children)}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-[#8B0000] dark:border-amber-400 bg-red-950/5 dark:bg-amber-400/10 text-slate-800 dark:text-slate-200 text-xs sm:text-sm p-4 my-4 rounded-r-xl border-y border-r border-slate-200 dark:border-slate-800/80 shadow-xs">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8B0000] dark:text-amber-400 uppercase tracking-wider mb-1.5">
                            <img
                              src="/images/csjmu-seal-logo.jpg"
                              alt="CSJMU Seal"
                              className="w-3.5 h-3.5 rounded-full object-contain shrink-0"
                            />
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Verified CSJMU Campus Fact</span>
                          </div>
                          <div className="leading-relaxed font-normal">{renderChildrenWithCitations(children)}</div>
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-950/40">
                          <table className="w-full text-left text-xs sm:text-sm border-collapse">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">{children}</tbody>
                      ),
                      tr: ({ children }) => (
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">{children}</tr>
                      ),
                      th: ({ children }) => (
                        <th className="p-3 font-semibold uppercase text-[11px] tracking-wider text-[#002B49] dark:text-amber-400">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => <td className="p-3 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{renderChildrenWithCitations(children)}</td>,
                      a: ({ href, children }: any) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#002B49] dark:text-amber-400 hover:underline font-semibold transition-colors"
                        >
                          {children}
                        </a>
                      ),
                      hr: () => <hr className="border-t border-slate-200 dark:border-slate-800 my-5" />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>

                  {/* Active Streaming Typing Cursor */}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-[#8B0000] dark:bg-amber-400 animate-pulse align-middle ml-1 rounded-sm shadow-xs" />
                  )}
                </div>
              )}

              {/* Structured CSJMU Verified Facts Card (If facts prop is provided) */}
              {!message.isStreaming && message.facts && (
                <div className="mt-4 p-4 rounded-xl bg-red-950/5 dark:bg-amber-400/10 border border-[#8B0000]/20 dark:border-amber-400/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8B0000] dark:text-amber-400 uppercase tracking-wider">
                    <img
                      src="/images/csjmu-seal-logo.jpg"
                      alt="CSJMU Seal"
                      className="w-3.5 h-3.5 rounded-full object-contain shrink-0"
                    />
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Verified CSJMU Information</span>
                  </div>

                  {Array.isArray(message.facts) ? (
                    <ul className="space-y-1 text-xs text-slate-800 dark:text-slate-200 pl-4 list-disc marker:text-[#8B0000] dark:marker:text-amber-400">
                      {message.facts.map((fact, fIdx) => (
                        <li key={fIdx}>{fact}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.entries(message.facts).map(([key, val], fIdx) => (
                        <div key={fIdx} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="font-semibold text-[#002B49] dark:text-amber-400">{key}: </span>
                          <span className="text-slate-700 dark:text-slate-300">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Dedicated Sources & Citations Section */}
              {!message.isStreaming && (
                <SourceSection sources={message.sources} messageId={message.id} />
              )}

              {/* Dedicated Smart Follow-Up Suggestions & AI Quick Actions Section */}
              {!message.isStreaming && onSelectQuery && (
                <SuggestionSection
                  suggestions={message.suggestions}
                  onSelectQuery={onSelectQuery}
                  disabled={disabled}
                  lastAssistantContent={message.content}
                />
              )}

              {/* Response Actions Toolbar */}
              {!message.isStreaming && (
                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-tight">
                    {message.timestamp}
                  </span>

                  <MessageActions
                    messageId={message.id}
                    question={message.rawQuestion || ''}
                    answer={message.content}
                    sessionId={sessionId}
                    onCopy={() => onCopyText(message.id, message.content)}
                    isCopied={isCopied}
                    onRegenerate={onRegenerate}
                    isLastMessage={isLastMessage}
                    disabled={disabled}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Avatar Column: Invisible Spacer if Assistant; User Avatar if User */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-[#002B49] text-white flex items-center justify-center shrink-0 shadow-xs mt-1 border border-blue-900/50">
          <User className="w-4 h-4 text-amber-300" />
        </div>
      ) : (
        <div className="w-8 h-8 shrink-0 opacity-0 pointer-events-none mt-1 aria-hidden" aria-hidden="true" />
      )}
    </motion.div>
  );
};
