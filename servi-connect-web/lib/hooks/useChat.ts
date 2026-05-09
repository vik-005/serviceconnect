import { useEffect, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { Message } from '../types/message';
import { toast } from 'sonner';

const MERCURE_URL = process.env.NEXT_PUBLIC_MERCURE_URL || 'http://localhost:3000/.well-known/mercure';

import { useTypingStore } from '../stores/typingStore';

export const useChat = (conversationId?: number) => {
  const { addMessage, updateConversation } = useChatStore();
  const setTyping = useTypingStore((state) => state.setTyping);
  const removeTyping = useTypingStore((state) => state.removeTyping);

  const subscribeToMercure = useCallback(() => {
    if (!conversationId) return;

    const url = new URL(MERCURE_URL);
    url.searchParams.append('topic', `/conversations/${conversationId}`);
    
    let eventSource: EventSource | null = new EventSource(url, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.isTyping !== undefined) {
          // Typing event
          const typingUser = {
            userId: data.userId,
            firstName: data.firstName,
            lastName: data.lastName || '',
            timestamp: new Date(data.timestamp).getTime()
          };
          if (data.isTyping) {
            setTyping(conversationId, typingUser);
          } else {
            removeTyping(conversationId, data.userId);
          }
          return;
        }

        const message: Message = data;
        
        addMessage(conversationId, message);
        updateConversation(conversationId, { 
          lastMessage: message,
          updatedAt: message.createdAt 
        });
      } catch (error) {
        console.error('Error parsing Mercure message', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Mercure Error', error);
      eventSource?.close();
      // Retry logic with backoff
      setTimeout(() => {
        subscribeToMercure();
      }, 5000);
    };

    return () => {
      eventSource?.close();
    };
  }, [conversationId, addMessage, updateConversation, setTyping, removeTyping]);

  useEffect(() => {
    const cleanup = subscribeToMercure();
    return cleanup;
  }, [subscribeToMercure]);

  return {}; // Could return sending status etc.
};
