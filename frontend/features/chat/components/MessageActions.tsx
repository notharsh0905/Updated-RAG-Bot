'use client';

import React, { useState } from 'react';
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown, Share2, CheckCheck } from 'lucide-react';
import { apiService } from '@/services/api';
import { safeCopyToClipboard } from '@/utils/generateId';
import { FeedbackDialog } from './FeedbackDialog';

interface MessageActionsProps {
  messageId: string;
  question: string;
  answer: string;
  sessionId: string;
  onCopy: () => void;
  isCopied: boolean;
  onRegenerate?: () => void;
  isLastMessage?: boolean;
  disabled?: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  question,
  answer,
  sessionId,
  onCopy,
  isCopied,
  onRegenerate,
  isLastMessage,
  disabled,
}) => {
  const [liked, setLiked] = useState<boolean>(false);
  const [disliked, setDisliked] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);

  const handleLike = async () => {
    if (liked) return;
    try {
      await apiService.sendFeedback({
        session_id: sessionId,
        question,
        answer,
        rating: 1,
      });
      setLiked(true);
      setDisliked(false);
    } catch (e) {
      // Non-blocking fallback
    }
  };

  const handleDislikeSubmit = async (reason: string, comments: string) => {
    const fullComment = comments ? `${reason}: ${comments}` : reason;
    await apiService.sendFeedback({
      session_id: sessionId,
      question,
      answer,
      rating: -1,
      comments: fullComment,
    });
    setDisliked(true);
    setLiked(false);
  };

  const handleShare = () => {
    const shareText = `Official CSJMU Answer:\n\n${answer.slice(0, 200)}...\n\nSource: CSJMU AI Portal`;
    safeCopyToClipboard(shareText);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <>
      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 opacity-90 group-hover:opacity-100 transition-opacity">
        {/* Copy Button */}
        <button
          type="button"
          onClick={onCopy}
          className="p-1.5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/90 rounded-md transition-colors text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]"
          title="Copy response"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Regenerate Button (Last Message Only) */}
        {isLastMessage && onRegenerate && (
          <button
            type="button"
            disabled={disabled}
            onClick={onRegenerate}
            className="p-1.5 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-800/90 rounded-md transition-colors text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px] disabled:opacity-40"
            title="Regenerate last response"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8B0000] dark:text-amber-400" />
            <span className="hidden sm:inline font-medium">Regenerate</span>
          </button>
        )}

        {/* Like Button */}
        <button
          type="button"
          onClick={handleLike}
          className={`p-1.5 rounded-md transition-colors ${
            liked
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60'
              : 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800/90 text-slate-500 dark:text-slate-400'
          }`}
          title="Good response"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>

        {/* Dislike Button */}
        <button
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          className={`p-1.5 rounded-md transition-colors ${
            disliked
              ? 'text-red-600 dark:text-rose-400 bg-red-50 dark:bg-rose-950/40 border border-red-300 dark:border-rose-800/60'
              : 'hover:text-red-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800/90 text-slate-500 dark:text-slate-400'
          }`}
          title="Report problem / Poor response"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="p-1.5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/90 rounded-md transition-colors text-slate-500 dark:text-slate-400"
          title="Share excerpt"
        >
          {shared ? (
            <CheckCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          ) : (
            <Share2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Dislike Feedback Dialog Modal */}
      <FeedbackDialog
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleDislikeSubmit}
        question={question}
      />
    </>
  );
};
