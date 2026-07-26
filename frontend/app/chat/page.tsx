'use client';

import React from 'react';
import { ChatWindow } from '@/features/chat/ChatWindow';

export default function ChatPage() {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <ChatWindow />
    </div>
  );
}
