'use client';

import React from 'react';

export default function ChatRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 dark:bg-slate-950 text-slate-100 antialiased overflow-hidden selection:bg-[#1E88FF] selection:text-white">
      {children}
    </div>
  );
}
