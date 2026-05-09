import { useEffect, useRef } from 'react';
import api from '../api/axios';

export const useConversationPolling = (conversationId: number | null | undefined, enabled: boolean = true) => {
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !conversationId) return;

    // Poll every 2 seconds for new messages and typing indicators
    const pollConversation = async () => {
      try {
        const [messagesRes, typingRes] = await Promise.all([
          api.get(`/api/conversations/${conversationId}/messages?limit=5`),
          api.get(`/api/conversations/${conversationId}/typing-users`),
        ]);

        // Typing users will be broadcast to the typing store via WebSocket or polling response
        // This would normally be handled by your real-time system
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Start polling
    pollConversation();
    pollingIntervalRef.current = setInterval(pollConversation, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [conversationId, enabled]);
};

/**
 * WebSocket Connection Manager for real-time chat
 * This is a placeholder for future WebSocket/Mercure integration
 * Currently uses HTTP polling as fallback
 */
export const useConversationWebSocket = (conversationId: number | null | undefined) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const connectWebSocket = () => {
      try {
        // Replace with your actual WebSocket URL (e.g., ws://localhost:8000/conversations/${conversationId})
        // const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // const wsUrl = `${protocol}//localhost:8000/api/conversations/${conversationId}/ws`;
        
        // For now, we're using HTTP polling as fallback
        // wsRef.current = new WebSocket(wsUrl);
        
        // wsRef.current.onopen = () => {
        //   console.log('WebSocket connected');
        // };

        // wsRef.current.onmessage = (event) => {
        //   const data = JSON.parse(event.data);
        //   // Handle incoming message (new message, typing indicator, etc)
        //   console.log('WebSocket message:', data);
        // };

        // wsRef.current.onerror = (error) => {
        //   console.error('WebSocket error:', error);
        //   // Fallback to polling
        // };
      } catch (error) {
        console.error('WebSocket connection error:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [conversationId]);

  return wsRef;
};
