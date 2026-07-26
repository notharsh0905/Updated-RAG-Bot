'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'text', code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl bg-slate-950/95 border border-slate-800/90 shadow-md overflow-hidden my-4 group">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span className="capitalize font-medium">{language || 'code'}</span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[11px] font-sans"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Snippet Canvas */}
      <div className="p-4 overflow-x-auto custom-scrollbar bg-slate-950">
        <pre className="font-mono text-[13px] leading-relaxed text-slate-200 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
