'use client';

import React from 'react';
import './globals.css';
import { TopBar } from '@/components/layout/TopBar';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Chhatrapati Shahu Ji Maharaj University (CSJMU) — UIET Enterprise AI Portal</title>
        <meta name="description" content="Official Enterprise Platform & Intelligent Assistant for Chhatrapati Shahu Ji Maharaj University & UIET Kanpur." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/csjmu-seal-logo.jpg" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-[#8B0000] selection:text-white overflow-x-hidden w-full max-w-full">
        <ThemeProvider>
          <TopBar />
          <Navbar />
          <div className="flex flex-1 relative">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">{children}</main>
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
