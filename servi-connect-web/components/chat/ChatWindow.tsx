'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../../lib/stores/chatStore';
import { useTypingStore } from '../../lib/stores/typingStore';
import { useAuth } from '../../lib/hooks/useAuth';
import { useConversationMessages } from '../../lib/hooks/useConversationMessages';
import { useMarkMessagesAsRead } from '../../lib/hooks/useMarkMessagesAsRead';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import Avatar from '../ui/Avatar';
import { Phone, Info, MoreVertical, MessageSquare } from 'lucide-react';
import Spinner from '../ui/Spinner';

const ChatWindow: React.FC = () => {
  const { activeConversationId, conversations } = useChatStore();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingUsers = useTypingStore((state) => state.typingUsers[activeConversationId || 0] || []);
  
  // Use the hook to manage messages and sending
  const { 
    messages, 
    isLoading, 
    isSending,
    isUploading,
    sendTextMessage, 
    sendMediaMessage 
  } = useConversationMessages(activeConversationId);

  // Mark messages as read when conversation opens
  const { mutate: markAsRead } = useMarkMessagesAsRead();


  const conversation = conversations.find(c => c.id === activeConversationId);
  const otherUser = conversation?.participants[0];

  // Mark messages as read when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (text: string, file?: File) => {
    if (file) {
      // Determine media type from file
      const mediaType = file.type.startsWith('audio/') ? 'audio' 
                       : file.type.startsWith('video/') ? 'video' 
                       : 'image';
      await sendMediaMessage(file, mediaType);
    } else if (text.trim()) {
      await sendTextMessage(text);
    }
  }, [sendTextMessage, sendMediaMessage]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-gray-100">
          <MessageSquare size={40} className="text-blue-200" />
        </div>
        <p className="font-medium">Sélectionnez une conversation pour commencer</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <Avatar src={otherUser?.avatarUrl} alt={`${otherUser?.firstName} ${otherUser?.lastName}`} size="md" />
          <div>
            <h3 className="font-bold text-gray-900">{otherUser?.firstName} {otherUser?.lastName}</h3>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">En ligne</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
            <Phone size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all md:hidden">
            <Info size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-6 space-y-1 scroll-smooth"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Aucun message pour le moment</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isMine={msg.senderId === user?.id} 
              />
            ))}
            {typingUsers.length > 0 && (
              <TypingIndicator names={typingUsers.map(u => `${u.firstName} ${u.lastName}`.trim())} />
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput 
        onSend={handleSend}
        conversationId={activeConversationId}
        isDisabled={isSending || isUploading}
      />
    </div>
  );
};

export default ChatWindow;
