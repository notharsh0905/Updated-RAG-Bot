'use client';

import React, { useState } from 'react';
import { DocumentSource } from '@/types/chat';
import { CitationTooltip } from './CitationTooltip';

interface CitationBadgeProps {
  index: number;
  messageId?: string;
  source?: DocumentSource | null;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({ index, messageId, source }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const anchorId = messageId ? `citation-anchor-${messageId}-${index}` : `citation-anchor-${index}`;
  const targetCardId = messageId ? `source-card-${messageId}-${index - 1}` : `source-card-${index - 1}`;

  const triggerScrollToSource = () => {
    const targetElement = document.getElementById(targetCardId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('ring-2', 'ring-amber-400', 'shadow-amber-400/20', 'bg-slate-900/90');
      setTimeout(() => {
        targetElement.classList.remove('ring-2', 'ring-amber-400', 'shadow-amber-400/20');
      }, 2500);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerScrollToSource();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerScrollToSource();
    }
  };

  return (
    <span className="relative inline-block align-baseline">
      <button
        id={anchorId}
        type="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`Citation ${index}: ${source?.source || 'Document Source'}`}
        className="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 text-[10px] font-mono font-bold bg-[#002B49] hover:bg-[#A51C30] text-amber-300 hover:text-white border border-amber-400/40 hover:border-amber-400 rounded-md transition-all shadow-sm active:scale-95 cursor-pointer align-baseline select-none focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        [{index}]
      </button>

      <CitationTooltip
        source={source}
        index={index}
        isVisible={showTooltip}
      />
    </span>
  );
};
