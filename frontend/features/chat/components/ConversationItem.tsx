'use client';

import React, { useState } from 'react';
import { MessageSquare, Pin, Edit3, Trash2, MoreHorizontal } from 'lucide-react';
import { Conversation } from '@/types/conversation';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer select-none ${
        isActive
          ? 'bg-slate-200 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-semibold shadow-xs'
          : 'bg-transparent border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 pr-1">
        <MessageSquare
          className={`w-3.5 h-3.5 shrink-0 ${
            isActive ? 'text-[#1268D4] dark:text-[#1E88FF]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
          }`}
        />
        <span className="truncate text-xs font-sans leading-tight">
          {conversation.title}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* Pinned Badge */}
        {conversation.isPinned && (
          <Pin className="w-3 h-3 text-[#1268D4] dark:text-[#1E88FF] rotate-45 shrink-0" />
        )}

        {/* Action Trigger Menu Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-300 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-opacity"
          title="Conversation options"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Action Menu Popover */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
          <div className="absolute right-1 top-8 z-40 w-36 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xl space-y-0.5 text-xs text-slate-800 dark:text-slate-200 backdrop-blur-md">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onTogglePin();
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors font-medium"
            >
              <Pin className="w-3.5 h-3.5 text-[#1268D4] dark:text-[#1E88FF]" />
              <span>{conversation.isPinned ? 'Unpin' : 'Pin'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onRename();
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors font-medium"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Rename</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onDelete();
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-rose-950/60 text-red-600 dark:text-rose-300 text-left transition-colors font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-rose-400" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
