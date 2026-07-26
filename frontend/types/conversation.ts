import { ChatMessage } from './chat';

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  messages: ChatMessage[];
}

export type TimeGroup = 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Previous 30 Days' | 'Older';

export interface GroupedConversations {
  pinned: Conversation[];
  today: Conversation[];
  yesterday: Conversation[];
  last7Days: Conversation[];
  last30Days: Conversation[];
  older: Conversation[];
}
