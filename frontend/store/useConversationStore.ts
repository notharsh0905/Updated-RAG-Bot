import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation, GroupedConversations } from '@/types/conversation';
import { ChatMessage } from '@/types/chat';

interface ConversationState {
  activeId: string;
  conversations: Conversation[];
  searchQuery: string;

  setSearchQuery: (query: string) => void;
  setActiveId: (id: string) => void;
  createConversation: () => string;
  updateConversationMessages: (id: string, messages: ChatMessage[], firstQuestion?: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  togglePinConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  getActiveConversation: () => Conversation | undefined;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      activeId: 'default-session',
      conversations: [
        {
          id: 'default-session',
          title: 'CSJMU B.Tech Admission Info',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: false,
          messages: [],
        },
      ],
      searchQuery: '',

      setSearchQuery: (query) => set({ searchQuery: query }),

      setActiveId: (id) => set({ activeId: id }),

      createConversation: () => {
        const newId = crypto.randomUUID();
        const newConv: Conversation = {
          id: newId,
          title: 'New Conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: false,
          messages: [],
        };

        set((state) => ({
          conversations: [newConv, ...state.conversations],
          activeId: newId,
        }));

        return newId;
      },

      updateConversationMessages: (id, messages, firstQuestion) => {
        set((state) => {
          const convIndex = state.conversations.findIndex((c) => c.id === id);
          const now = new Date().toISOString();

          if (convIndex === -1) {
            // Create if missing
            const title = firstQuestion ? (firstQuestion.length > 32 ? `${firstQuestion.slice(0, 32)}...` : firstQuestion) : 'New Conversation';
            const newConv: Conversation = {
              id,
              title,
              createdAt: now,
              updatedAt: now,
              isPinned: false,
              messages,
            };
            return { conversations: [newConv, ...state.conversations] };
          }

          const existing = state.conversations[convIndex];
          const updatedTitle =
            existing.title === 'New Conversation' && firstQuestion
              ? firstQuestion.length > 32
                ? `${firstQuestion.slice(0, 32)}...`
                : firstQuestion
              : existing.title;

          const updatedConv: Conversation = {
            ...existing,
            title: updatedTitle,
            updatedAt: now,
            messages,
          };

          const updatedList = [...state.conversations];
          updatedList[convIndex] = updatedConv;

          return { conversations: updatedList };
        });
      },

      renameConversation: (id, newTitle) => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title: trimmed, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      togglePinConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
          ),
        }));
      },

      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          let newActiveId = state.activeId;

          if (state.activeId === id) {
            if (filtered.length > 0) {
              newActiveId = filtered[0].id;
            } else {
              const freshId = crypto.randomUUID();
              const freshConv: Conversation = {
                id: freshId,
                title: 'New Conversation',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isPinned: false,
                messages: [],
              };
              return { conversations: [freshConv], activeId: freshId };
            }
          }

          return { conversations: filtered, activeId: newActiveId };
        });
      },

      getActiveConversation: () => {
        const { conversations, activeId } = get();
        return conversations.find((c) => c.id === activeId);
      },
    }),
    {
      name: 'csjmu_conversations_v2.5',
    }
  )
);
