'use client';

import React from 'react';
import './globals.css';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { useChatStore } from '@/store/useChatStore';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useChatStore();

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <head>
        <title>University Institute of Engineering and Technology (UIET) — Official CSJMU AI Portal</title>
        <meta name="description" content="Official Intelligent Campus Assistant for Chhatrapati Shahu Ji Maharaj University & UIET Kanpur." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-csjmu-gold selection:text-csjmu-navy">
        <TopBar />
        <Navbar />
        <div className="flex flex-1 relative">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
