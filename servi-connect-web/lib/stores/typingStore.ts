import { create } from 'zustand';

interface TypingUser {
  userId: number;
  firstName: string;
  lastName: string;
  timestamp: number;
}

interface TypingStore {
  typingUsers: Record<number, TypingUser[]>; // conversationId -> array of typing users
  setTyping: (conversationId: number, user: TypingUser) => void;
  removeTyping: (conversationId: number, userId: number) => void;
  clearTyping: (conversationId: number) => void;
}

// Auto-remove typing indicator after 3 seconds of inactivity
const TYPING_TIMEOUT = 3000;

export const useTypingStore = create<TypingStore>((set) => ({
  typingUsers: {},

  setTyping: (conversationId, user) => {
    set((state) => {
      const conversationTyping = state.typingUsers[conversationId] || [];
      
      // Remove existing entry for this user and add new one
      const filtered = conversationTyping.filter((u) => u.userId !== user.userId);
      const updated = [...filtered, { ...user, timestamp: Date.now() }];

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: updated,
        },
      };
    });

    // Auto-remove after timeout
    const timeoutId = setTimeout(() => {
      set((state) => {
        const updated = (state.typingUsers[conversationId] || []).filter(
          (u) => u.userId !== user.userId
        );
        return {
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: updated.length > 0 ? updated : undefined as unknown as TypingUser[],
          },
        };
      });
    }, TYPING_TIMEOUT);

    return () => clearTimeout(timeoutId);
  },

  removeTyping: (conversationId, userId) => {
    set((state) => {
      const updated = (state.typingUsers[conversationId] || []).filter(
        (u) => u.userId !== userId
      );
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: updated.length > 0 ? updated : undefined as unknown as TypingUser[],
        },
      };
    });
  },

  clearTyping: (conversationId) => {
    set((state) => {
      const newState = { ...state.typingUsers };
      delete newState[conversationId];
      return { typingUsers: newState };
    });
  },
}));
