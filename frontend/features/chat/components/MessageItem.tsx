'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { CodeBlock } from './CodeBlock';

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} w-full group`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#002B49] via-slate-900 to-[#8B0000] text-amber-300 border border-[#D4AF37]/50 flex items-center justify-center shrink-0 shadow-md ring-2 ring-slate-800/60 mt-1">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
      )}

      {/* Message Content Enclosure */}
      <div className={`space-y-1.5 ${isUser ? 'max-w-[85%] sm:max-w-[78%]' : 'max-w-[92%] sm:max-w-[88%] flex-1'}`}>
        <div
          className={`rounded-2xl shadow-sm transition-all ${
            isUser
              ? 'bg-[#A51C30]/15 border border-[#A51C30]/40 text-slate-100 rounded-tr-xs px-4.5 py-3.5'
              : 'bg-slate-900/70 border border-slate-800/90 backdrop-blur-md text-slate-100 rounded-tl-xs p-4.5 sm:p-5.5 hover:border-slate-700/80'
          }`}
        >
          {/* Markdown Content Area */}
          <div className="text-[14px] sm:text-[15px] leading-7 font-sans">
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
                      className="bg-slate-800/90 border border-slate-700/60 text-amber-300 font-mono text-[12px] px-1.5 py-0.5 rounded-md font-normal"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                h1: ({ children }) => (
                  <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight mt-6 mb-3 border-b border-slate-800 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-white tracking-tight mt-5 mb-2.5">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base sm:text-lg font-semibold text-slate-100 mt-4 mb-2">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-sm font-semibold text-amber-400 mt-3 mb-1.5">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-[14px] sm:text-[15px] leading-7 text-slate-200 mb-3.5 last:mb-0 font-normal">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1.5 my-3 pl-4 list-disc marker:text-amber-400 text-[14px] sm:text-[15px] text-slate-200">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-1.5 my-3 pl-4 list-decimal marker:text-amber-400 font-semibold text-[14px] sm:text-[15px] text-slate-200">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-3 border-amber-400 bg-slate-950/60 text-slate-300 italic text-xs sm:text-sm pl-4 py-2.5 my-3.5 rounded-r-xl border-y border-r border-slate-800/60">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 rounded-xl border border-slate-800 shadow-sm bg-slate-950/40">
                    <table className="w-full text-left text-xs border-collapse">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-slate-900/90 text-slate-200 font-semibold border-b border-slate-800">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-slate-800/30 transition-colors">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="p-3 font-semibold uppercase text-[11px] tracking-wider text-amber-400">
                    {children}
                  </th>
                ),
                td: ({ children }) => <td className="p-3 text-slate-300 text-xs">{children}</td>,
                a: ({ href, children }: any) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 underline decoration-amber-400/40 hover:decoration-amber-300 font-medium transition-colors"
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="border-t border-slate-800 my-5" />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Action Toolbar & Timestamp for Assistant Message */}
          {!isUser && (
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="text-[10px] font-mono text-slate-500 tracking-tight">
                {message.timestamp}
              </span>

              <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onCopyText(message.id, message.content)}
                  className="flex items-center gap-1.5 px-2 py-1 hover:text-white hover:bg-slate-800/90 border border-transparent hover:border-slate-700/60 rounded-md transition-all text-[11px] font-sans text-slate-400"
                  title="Copy full response"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied response</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shrink-0 shadow-sm mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
};
