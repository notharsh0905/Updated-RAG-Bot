import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation } from '@/types/conversation';
import { ChatMessage } from '@/types/chat';

interface ConversationState {
  activeId: string;
  conversations: Conversation[];
  searchQuery: string;

  // Actions
  setSearchQuery: (query: string) => void;
  setActiveId: (id: string) => void;
  createConversation: () => string;
  renameConversation: (id: string, newTitle: string) => void;
  togglePinConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  getActiveConversation: () => Conversation | undefined;
  getActiveMessages: () => ChatMessage[];

  // Granular Active Message Mutation Actions
  addMessageToActive: (msg: ChatMessage) => void;
  appendTokenToActive: (messageId: string, token: string) => void;
  updateActiveMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  finishActiveMessageStreaming: (messageId: string, suggestions?: any[]) => void;
  removeMessageFromActive: (messageId: string) => void;
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
          messages: [], // Initialize empty so welcome EmptyState renders when conversation starts
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
          messages: [], // Initialize empty
        };

        set((state) => ({
          conversations: [newConv, ...state.conversations],
          activeId: newId,
        }));

        return newId;
      },

      getActiveConversation: () => {
        const { conversations, activeId } = get();
        return conversations.find((c) => c.id === activeId);
      },

      getActiveMessages: () => {
        const active = get().getActiveConversation();
        return active?.messages || [];
      },

      // Granular mutation: add user/assistant message to active conversation
      addMessageToActive: (msg: ChatMessage) => {
        set((state) => {
          const activeId = state.activeId;
          const convIndex = state.conversations.findIndex((c) => c.id === activeId);
          const now = new Date().toISOString();

          if (convIndex === -1) {
            const title = msg.role === 'user'
              ? (msg.content.length > 32 ? `${msg.content.slice(0, 32)}...` : msg.content)
              : 'New Conversation';
            const newConv: Conversation = {
              id: activeId,
              title,
              createdAt: now,
              updatedAt: now,
              isPinned: false,
              messages: [msg],
            };
            return { conversations: [newConv, ...state.conversations] };
          }

          const existing = state.conversations[convIndex];
          const updatedTitle =
            existing.title === 'New Conversation' && msg.role === 'user'
              ? (msg.content.length > 32 ? `${msg.content.slice(0, 32)}...` : msg.content)
              : existing.title;

          const updatedConv: Conversation = {
            ...existing,
            title: updatedTitle,
            updatedAt: now,
            messages: [...existing.messages, msg],
          };

          const updatedList = [...state.conversations];
          updatedList[convIndex] = updatedConv;
          return { conversations: updatedList };
        });
      },

      // Granular mutation: append streaming token preserving messageId
      appendTokenToActive: (messageId: string, token: string) => {
        set((state) => {
          const activeId = state.activeId;
          const convIndex = state.conversations.findIndex((c) => c.id === activeId);
          if (convIndex === -1) return state;

          const existing = state.conversations[convIndex];
          const updatedMessages = existing.messages.map((m) =>
            m.id === messageId
              ? { ...m, content: m.content + token, isStreaming: true }
              : m
          );

          const updatedConv: Conversation = {
            ...existing,
            updatedAt: new Date().toISOString(),
            messages: updatedMessages,
          };

          const updatedList = [...state.conversations];
          updatedList[convIndex] = updatedConv;
          return { conversations: updatedList };
        });
      },

      // Granular mutation: update specific message fields preserving messageId
      updateActiveMessage: (messageId: string, updates: Partial<ChatMessage>) => {
        set((state) => {
          const activeId = state.activeId;
          const convIndex = state.conversations.findIndex((c) => c.id === activeId);
          if (convIndex === -1) return state;

          const existing = state.conversations[convIndex];
          const updatedMessages = existing.messages.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          );

          const updatedConv: Conversation = {
            ...existing,
            updatedAt: new Date().toISOString(),
            messages: updatedMessages,
          };

          const updatedList = [...state.conversations];
          updatedList[convIndex] = updatedConv;
          return { conversations: updatedList };
        });
      },

      // Granular mutation: complete message streaming preserving messageId
      finishActiveMessageStreaming: (messageId: string, suggestions?: any[]) => {
        set((state) => {
          const activeId = state.activeId;
          const convIndex = state.conversations.findIndex((c) => c.id === activeId);
          if (convIndex === -1) return state;

          const existing = state.conversations[convIndex];
          const updatedMessages = existing.messages.map((m) => {
            if (m.id === messageId || m.isStreaming) {
              return {
                ...m,
                isStreaming: false,
                suggestions: suggestions || m.suggestions,
              };
            }
            return m;
          });

          const updatedConv: Conversation = {
            ...existing,
            updatedAt: new Date().toISOString(),
            messages: updatedMessages,
          };

          const updatedList = [...state.conversations];
          updatedList[convIndex] = updatedConv;
          return { conversations: updatedList };
        });
      },

      // Granular mutation: remove message from active conversation
      removeMessageFromActive: (messageId: string) => {
        set((state) => {
          const activeId = state.activeId;
          const convIndex = state.conversations.findIndex((c) => c.id === activeId);
          if (convIndex === -1) return state;

          const existing = state.conversations[convIndex];
          const updatedMessages = existing.messages.filter((m) => m.id !== messageId);

          const updatedConv: Conversation = {
            ...existing,
            updatedAt: new Date().toISOString(),
            messages: updatedMessages,
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
    }),
    {
      name: 'csjmu_conversations_v2.5',
    }
  )
);
