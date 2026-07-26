'use client';

import React from 'react';

interface CitationBadgeProps {
  index: number;
  messageId?: string;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({ index, messageId }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const targetCardId = messageId ? `source-card-${messageId}-${index - 1}` : `source-card-${index - 1}`;
    const targetElement = document.getElementById(targetCardId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('ring-2', 'ring-amber-400', 'shadow-amber-400/20');
      setTimeout(() => {
        targetElement.classList.remove('ring-2', 'ring-amber-400', 'shadow-amber-400/20');
      }, 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 text-[10px] font-mono font-bold bg-[#002B49] hover:bg-[#A51C30] text-amber-300 hover:text-white border border-amber-400/40 hover:border-amber-400 rounded-md transition-all shadow-sm active:scale-95 cursor-pointer align-baseline select-none"
      title={`Jump to Source [${index}]`}
    >
      [{index}]
    </button>
  );
};
