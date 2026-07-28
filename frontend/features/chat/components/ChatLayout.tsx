'use client';

import React from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';

interface ChatLayoutProps {
  children: React.ReactNode;
  onNewChat: () => void;
  onSelectQuery: (query: string) => void;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  children,
  onNewChat,
  onSelectQuery,
}) => {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useChatStore();

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative">
      {/* Responsive Collapsible Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={onNewChat}
        onSelectQuery={onSelectQuery}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-white dark:bg-slate-900/90 relative overflow-hidden">
        <ChatHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          onNewChat={onNewChat}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};
