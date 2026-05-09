import { create } from 'zustand';
import { Conversation, Message } from '../types/message';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: number | null;
  messages: Record<number, Message[]>; // conversationId -> messages
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversationId: (id: number | null) => void;
  addMessage: (conversationId: number, message: Message) => void;
  setMessages: (conversationId: number, messages: Message[]) => void;
  updateConversation: (conversationId: number, update: Partial<Conversation>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  setConversations: (conversations) => set({ conversations }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  addMessage: (conversationId, message) => 
    set((state) => {
      const currentMessages = state.messages[conversationId] || [];
      // Avoid duplicates
      if (currentMessages.find(m => m.id === message.id)) return state;
      
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...currentMessages, message],
        }
      };
    }),
  setMessages: (conversationId, messages) => 
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      }
    })),
  updateConversation: (conversationId, update) => 
    set((state) => ({
      conversations: state.conversations.map((c) => 
        c.id === conversationId ? { ...c, ...update } : c
      ),
    })),
}));
