'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  Sparkles,
  BookOpen,
  DollarSign,
  Briefcase,
  Home as HomeIcon,
  Building,
  GraduationCap,
  Award,
  HelpCircle,
  PhoneCall,
  Info,
  X,
  Clock,
  Pin,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { useConversationStore } from '@/store/useConversationStore';
import { Conversation } from '@/types/conversation';
import { ConversationSearch } from './ConversationSearch';
import { ConversationItem } from './ConversationItem';
import { RenameDialog } from './RenameDialog';
import { DeleteDialog } from './DeleteDialog';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectQuery: (query: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onSelectQuery,
}) => {
  const {
    conversations,
    activeId,
    setActiveId,
    createConversation,
    renameConversation,
    togglePinConversation,
    deleteConversation,
    searchQuery,
    setSearchQuery,
  } = useConversationStore();

  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const quickCategories = [
    { label: 'B.Tech Admissions', query: 'What is the admission procedure for B.Tech CSE at UIET?', icon: BookOpen },
    { label: 'Scholarships & Aid', query: 'What scholarships and UP fee reimbursement rules apply?', icon: DollarSign },
    { label: 'Placements & Packages', query: 'What is the highest placement package and top recruiters at UIET?', icon: Briefcase },
    { label: 'Hostel Facilities', query: 'What hostel facilities, mess, rules, and curfew timings exist?', icon: HomeIcon },
    { label: 'UIET Departments', query: 'What engineering departments and programs exist under UIET?', icon: Building },
    { label: 'Faculty & Mentorship', query: 'Tell me about the faculty background and mentorship at UIET.', icon: GraduationCap },
  ];

  // Group conversations by search query & time ranges
  const { pinned, today, yesterday, last7Days, last30Days, older } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = conversations.filter((c) => {
      if (!q) return true;
      const titleMatch = c.title.toLowerCase().includes(q);
      const msgMatch = c.messages.some((m) => m.content.toLowerCase().includes(q));
      return titleMatch || msgMatch;
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const day7Start = todayStart - 7 * 86400000;
    const day30Start = todayStart - 30 * 86400000;

    const pinnedList: Conversation[] = [];
    const todayList: Conversation[] = [];
    const yesterdayList: Conversation[] = [];
    const last7List: Conversation[] = [];
    const last30List: Conversation[] = [];
    const olderList: Conversation[] = [];

    filtered.forEach((c) => {
      if (c.isPinned) {
        pinnedList.push(c);
        return;
      }

      const cTime = new Date(c.updatedAt).getTime();
      if (cTime >= todayStart) {
        todayList.push(c);
      } else if (cTime >= yesterdayStart) {
        yesterdayList.push(c);
      } else if (cTime >= day7Start) {
        last7List.push(c);
      } else if (cTime >= day30Start) {
        last30List.push(c);
      } else {
        olderList.push(c);
      }
    });

    return {
      pinned: pinnedList,
      today: todayList,
      yesterday: yesterdayList,
      last7Days: last7List,
      last30Days: last30List,
      older: olderList,
    };
  }, [conversations, searchQuery]);

  const handleCreateNewChat = () => {
    onNewChat();
    onClose();
  };

  const handleSelectConv = (id: string) => {
    setActiveId(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 flex flex-col w-72 bg-slate-950 text-slate-200 border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#002B49] to-[#8B0000] border border-[#D4AF37]/40 flex items-center justify-center font-bold text-xs text-white shadow-sm">
              CSJMU
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-tight text-white font-serif">
                UIET AI Portal
              </h2>
              <p className="text-[10px] text-amber-400 font-semibold">Official Knowledge Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Start New Chat CTA & Search */}
        <div className="p-3 space-y-2">
          <button
            onClick={handleCreateNewChat}
            className="w-full flex items-center justify-between py-2.5 px-3.5 bg-gradient-to-r from-[#002B49] to-[#A51C30] hover:from-[#003B63] hover:to-[#8B0000] text-white rounded-xl font-medium text-xs transition-all shadow-md active:scale-98 border border-white/10 group"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-300" />
              <span>New Conversation</span>
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black/30 rounded text-slate-300 border border-white/10">
              ⌘K
            </kbd>
          </button>

          <ConversationSearch
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Scrollable Conversation List & Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
          {/* Pinned Conversations */}
          {pinned.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                <Pin className="w-3 h-3 text-amber-400" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5">
                {pinned.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={activeId === conv.id}
                    onSelect={() => handleSelectConv(conv.id)}
                    onRename={() => setRenameTarget(conv)}
                    onTogglePin={() => togglePinConversation(conv.id)}
                    onDelete={() => setDeleteTarget(conv)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Today Conversations */}
          {today.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Today</span>
              </div>
              <div className="space-y-0.5">
                {today.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={activeId === conv.id}
                    onSelect={() => handleSelectConv(conv.id)}
                    onRename={() => setRenameTarget(conv)}
                    onTogglePin={() => togglePinConversation(conv.id)}
                    onDelete={() => setDeleteTarget(conv)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday Conversations */}
          {yesterday.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Yesterday
              </div>
              <div className="space-y-0.5">
                {yesterday.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={activeId === conv.id}
                    onSelect={() => handleSelectConv(conv.id)}
                    onRename={() => setRenameTarget(conv)}
                    onTogglePin={() => togglePinConversation(conv.id)}
                    onDelete={() => setDeleteTarget(conv)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Previous 7 Days */}
          {last7Days.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Previous 7 Days
              </div>
              <div className="space-y-0.5">
                {last7Days.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={activeId === conv.id}
                    onSelect={() => handleSelectConv(conv.id)}
                    onRename={() => setRenameTarget(conv)}
                    onTogglePin={() => togglePinConversation(conv.id)}
                    onDelete={() => setDeleteTarget(conv)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Older Conversations */}
          {(last30Days.length > 0 || older.length > 0) && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Older History
              </div>
              <div className="space-y-0.5">
                {[...last30Days, ...older].map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={activeId === conv.id}
                    onSelect={() => handleSelectConv(conv.id)}
                    onRename={() => setRenameTarget(conv)}
                    onTogglePin={() => togglePinConversation(conv.id)}
                    onDelete={() => setDeleteTarget(conv)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Topics & Campus Directory */}
          <div>
            <div className="px-2 mb-2 text-[11px] font-bold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Campus Quick Topics</span>
            </div>
            <div className="space-y-0.5">
              {quickCategories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectQuery(cat.query);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors text-left group"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 shrink-0 transition-colors" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <div className="px-2 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Campus Links
            </div>
            <div className="space-y-0.5">
              <Link
                href="/about"
                className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>About UIET Kanpur</span>
              </Link>
              <Link
                href="/help"
                className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Student FAQ & Help</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer User Info & Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-700">
              🎓
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">
                Guest Student User
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" /> NAAC A++ Campus Portal
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Rename Dialog Modal */}
      {renameTarget && (
        <RenameDialog
          isOpen={!!renameTarget}
          initialTitle={renameTarget.title}
          onClose={() => setRenameTarget(null)}
          onSave={(newTitle) => renameConversation(renameTarget.id, newTitle)}
        />
      )}

      {/* Delete Confirmation Dialog Modal */}
      {deleteTarget && (
        <DeleteDialog
          isOpen={!!deleteTarget}
          title={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteConversation(deleteTarget.id)}
        />
      )}
    </>
  );
};
