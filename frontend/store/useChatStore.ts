import { create } from 'zustand';

interface ChatStore {
  pendingQuestion: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  isAdminAuthenticated: boolean;

  // Transient UI Actions
  setPendingQuestion: (q: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setIsAdminAuthenticated: (auth: boolean) => void;
  resetUIState: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  pendingQuestion: null,
  isLoading: false,
  isStreaming: false,
  sidebarOpen: false, // Default to CLOSED as per requirements
  theme: 'system',
  isAdminAuthenticated: false,

  setPendingQuestion: (q) => set({ pendingQuestion: q }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  setIsAdminAuthenticated: (auth) => set({ isAdminAuthenticated: auth }),

  resetUIState: () =>
    set({
      pendingQuestion: null,
      isLoading: false,
      isStreaming: false,
    }),
}));
