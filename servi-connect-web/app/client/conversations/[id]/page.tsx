'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getConversationMessages } from '@/lib/api/conversations';
import { useChatStore } from '@/lib/stores/chatStore';
import { useChat } from '@/lib/hooks/useChat';
import ConversationsPage from '../page';

export default function ConversationDetailsPage() {
  const { id } = useParams();
  const convId = parseInt(id as string);
  const { setActiveConversationId, setMessages } = useChatStore();
  
  // Real-time hook for this specific conversation
  useChat(convId);

  useEffect(() => {
    setActiveConversationId(convId);
    return () => setActiveConversationId(null);
  }, [convId, setActiveConversationId]);

  const { data: messagesData } = useQuery({
    queryKey: ['messages', convId],
    queryFn: () => getConversationMessages(convId),
    enabled: !!convId,
  });

  useEffect(() => {
    if (messagesData && convId) {
      setMessages(convId, messagesData);
    }
  }, [messagesData, convId, setMessages]);

  // We reuse the layout from page.tsx but with this ID active
  return <ConversationsPage />;
}
