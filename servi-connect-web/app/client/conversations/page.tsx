'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConversations } from '@/lib/api/conversations';
import { useChatStore } from '@/lib/stores/chatStore';
import ConversationItem from '@/components/chat/ConversationItem';
import ChatWindow from '@/components/chat/ChatWindow';
import Spinner from '@/components/ui/Spinner';
import { Search } from 'lucide-react';

export default function ConversationsPage() {
  const { conversations, setConversations, activeConversationId, setActiveConversationId } = useChatStore();
  
  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
  });

  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
    }
  }, [conversationsData, setConversations]);

  // Automatically select first conversation if none active
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, setActiveConversationId]);

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-white">
      {/* List Column */}
      <div className="w-full md:w-[320px] lg:w-[400px] flex-shrink-0 flex flex-col border-r border-gray-100">
        <div className="p-6 border-b border-gray-50 bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">Messages</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-10 flex justify-center"><Spinner /></div>
          ) : conversations.length > 0 ? (
            conversations.map((c) => (
              <ConversationItem 
                key={c.id} 
                conversation={c} 
                isActive={c.id === activeConversationId}
                onClick={() => setActiveConversationId(c.id)}
              />
            ))
          ) : (
            <div className="p-10 text-center text-gray-400 italic text-sm">
              Aucune conversation pour le moment.
            </div>
          )}
        </div>
      </div>

      {/* Window Column */}
      <div className={`flex-1 flex overflow-hidden transition-all duration-300 ${
        !activeConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        <ChatWindow />
      </div>
    </div>
  );
}
