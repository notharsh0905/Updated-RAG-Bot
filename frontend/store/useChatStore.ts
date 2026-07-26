import { create } from 'zustand';
import { ChatMessage } from '@/types/chat';

interface ChatStore {
  sessionId: string;
  messages: ChatMessage[];
  pendingQuestion: string | null;
  isLoading: boolean;
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  isAdminAuthenticated: boolean;

  // Actions
  setPendingQuestion: (q: string | null) => void;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setIsLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setIsAdminAuthenticated: (auth: boolean) => void;
  resetChat: () => void;
}

const GREETINGS = [
  "Welcome to the Official CSJMU & UIET AI Assistant.",
  "Hello! I'm here to help you with admissions, academics, campus facilities and student services.",
  "Hi! Ask me anything about CSJMU or UIET."
];

function getRandomGreeting(): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'init-1',
  role: 'assistant',
  content: `👋 **${getRandomGreeting()}**\n\nHow can I help you today with admissions, courses, hostels, scholarships, fee structure, placements, or campus facilities?`,
  suggestions: [
    "What is the eligibility for B.Tech Computer Science?",
    "What scholarships and UP fee waivers are offered?",
    "What is the highest package in UIET placements?",
    "What facilities exist in the campus hostels?"
  ],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const useChatStore = create<ChatStore>((set) => ({
  sessionId: typeof window !== 'undefined' ? crypto.randomUUID() : 'default-session',
  messages: [INITIAL_WELCOME_MESSAGE],
  pendingQuestion: null,
  isLoading: false,
  sidebarOpen: true,
  theme: 'system',
  isAdminAuthenticated: false,

  setPendingQuestion: (q) => set({ pendingQuestion: q }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (msgs) => set({ messages: msgs }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  setIsAdminAuthenticated: (auth) => set({ isAdminAuthenticated: auth }),
  resetChat: () =>
    set({
      sessionId: crypto.randomUUID(),
      messages: [
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `👋 **${getRandomGreeting()}**\n\nHow can I assist you with CSJMU or UIET today?`,
          suggestions: [
            "What is the admission procedure for B.Tech?",
            "What scholarships and UP fee waivers are offered?",
            "What is the highest package in UIET placements?",
            "Tell me about the Innovation Center and PEZ printing."
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      pendingQuestion: null,
      isLoading: false,
    }),
}));
