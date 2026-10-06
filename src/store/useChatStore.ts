import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatApi } from '@/services/api/chatApi';
import type { ConciergeTurfCard, ConciergeAction, PlayerContext } from '@/services/ai/playerConciergeService';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  quickPills?: string[];
  turfCards?: ConciergeTurfCard[];
  action?: ConciergeAction;
}

interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  unreadCount: number;
  isTyping: boolean;
  messages: ChatMessage[];

  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  resetUnread: () => void;
  sendMessage: (text: string, context?: PlayerContext) => Promise<void>;
  sendQuickPrompt: (prompt: string, context?: PlayerContext) => Promise<void>;
  clearHistory: () => void;
}

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  sender: 'bot',
  text: `👋 **Welcome to Playo Sports Concierge!**\n\nI'm your instant match coordinator. Ask me to find premier grounds, check night availability, explain our new **Annual Pass (25% off bookings)**, or guide you through rewards redemption.\n\nHow can I help you play today?`,
  timestamp: 'Just now',
  quickPills: [
    '⚽ Football turfs',
    '🏏 Cricket nets',
    '🎟️ Annual Pass perks',
    '⏰ Open slots tonight',
    '💰 TurfPoints rewards',
  ],
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      isMinimized: false,
      unreadCount: 1, // Start with 1 so user notices the assistant bubble
      isTyping: false,
      messages: [INITIAL_WELCOME_MESSAGE],

      openChat: () => set({ isOpen: true, unreadCount: 0, isMinimized: false }),
      closeChat: () => set({ isOpen: false }),
      toggleChat: () => {
        const nextState = !get().isOpen;
        set({
          isOpen: nextState,
          unreadCount: nextState ? 0 : get().unreadCount,
          isMinimized: false,
        });
      },
      minimizeChat: () => set({ isMinimized: true }),
      maximizeChat: () => set({ isMinimized: false }),
      resetUnread: () => set({ unreadCount: 0 }),

      sendMessage: async (text: string, context?: PlayerContext) => {
        if (!text.trim()) return;

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          text: text.trim(),
          sender: 'user',
          timestamp: now,
        };

        // Append user message immediately
        set((state) => ({
          messages: [...state.messages, userMsg],
          isTyping: true,
        }));

        try {
          // Call chatApi adapter (which delegates to playerConciergeService)
          const response = await chatApi.sendMessage({
            message: text,
            userContext: context,
          });

          const botMsg: ChatMessage = {
            id: response.data.id,
            text: response.data.reply,
            sender: 'bot',
            timestamp: response.data.timestamp,
            quickPills: response.data.quickPills,
            turfCards: response.data.turfCards,
            action: response.data.action,
          };

          set((state) => ({
            messages: [...state.messages, botMsg],
            isTyping: false,
            unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
          }));
        } catch (error) {
          const errorMsg: ChatMessage = {
            id: `err-${Date.now()}`,
            text: 'I had trouble connecting to the concierge service. Please check your connection and try again.',
            sender: 'bot',
            timestamp: now,
          };
          set((state) => ({
            messages: [...state.messages, errorMsg],
            isTyping: false,
          }));
        }
      },

      sendQuickPrompt: async (prompt: string, context?: PlayerContext) => {
        await get().sendMessage(prompt, context);
      },

      clearHistory: () => {
        set({
          messages: [INITIAL_WELCOME_MESSAGE],
          unreadCount: 0,
        });
      },
    }),
    {
      name: 'playo-concierge-chat',
      partialize: (state) => ({
        messages: state.messages,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
