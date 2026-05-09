'use client';

import React from 'react';
import { Conversation } from '../../lib/types/message';
import Avatar from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, isActive, onClick }) => {
  const otherUser = conversation.participants[0]; // Simplified: assume other user is first
  const lastMsg = conversation.lastMessage;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-4 border-b border-gray-50 transition-colors hover:bg-gray-50 ${
        isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
      }`}
    >
      <div className="relative">
        <Avatar src={otherUser.avatarUrl} alt={`${otherUser.firstName} ${otherUser.lastName}`} size="md" />
        {conversation.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {conversation.unreadCount}
          </span>
        )}
      </div>
      <div className="ml-4 flex-1 text-left overflow-hidden">
        <div className="flex justify-between items-baseline">
          <h4 className="font-bold text-sm text-gray-900 truncate">
            {otherUser.firstName} {otherUser.lastName}
          </h4>
          {lastMsg && (
            <span className="text-[10px] text-gray-400">
              {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false, locale: fr })}
            </span>
          )}
        </div>
        <p className={`text-xs truncate ${conversation.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
          {lastMsg ? lastMsg.content : 'Nouvelle conversation'}
        </p>
      </div>
    </button>
  );
};

export default ConversationItem;
