'use client';

import React from 'react';

interface EvidenceHighlightProps {
  text: string;
}

export const EvidenceHighlight: React.FC<EvidenceHighlightProps> = ({ text }) => {
  if (!text) return null;

  // Regex pattern for key institutional terms, course names, fee amounts, and numbers
  const highlightRegex = /(B\.Tech|UIET|CSJMU|Kanpur|Scholarship|Reimbursement|Placements?|Hostels?|CSE|ECE|ME|CHE|MSE|AI|NVIDIA|Director|Fee|Waiver|GATE|\b\d+(?:\.\d+)?%?|\b\d+LPA\b|\b\d{4}-\d{2}\b)/gi;

  const parts = text.split(highlightRegex);

  return (
    <span className="leading-relaxed font-sans text-slate-200">
      {parts.map((part, idx) => {
        if (part.match(highlightRegex)) {
          return (
            <mark
              key={idx}
              className="bg-amber-400/15 text-amber-200 border-b border-amber-400/40 px-1 py-0.5 rounded font-medium"
            >
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
};
