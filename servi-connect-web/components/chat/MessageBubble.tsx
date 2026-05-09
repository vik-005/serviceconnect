'use client';

import React from 'react';
import { Message } from '../../lib/types/message';
import { format } from 'date-fns';
import { CheckCheck, Phone, FileIcon, Play, Pause } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMine }) => {
  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <img 
            src={message.mediaUrl} 
            alt="Media" 
            className="rounded-xl max-w-xs cursor-pointer hover:opacity-90 transition-opacity" 
          />
        );
      case 'audio':
        return (
          <div className="flex items-center space-x-3 bg-white/10 p-2 rounded-lg min-w-[200px]">
            <button className="p-2 bg-blue-500 rounded-full text-white">
              <Play size={16} fill="white" />
            </button>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-1/3" />
            </div>
            <span className="text-[10px] opacity-70">0:12</span>
          </div>
        );
      case 'video':
        return (
          <div className="relative rounded-xl overflow-hidden max-w-xs group">
            <video src={message.mediaUrl} className="w-full" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 group-hover:bg-black/40 transition-all">
              <Play size={40} className="text-white fill-white" />
            </div>
          </div>
        );
      case 'call_log':
        return (
          <div className="flex items-center space-x-2 py-1 px-2">
            <Phone size={14} className={isMine ? 'text-white' : 'text-blue-500'} />
            <span className="text-xs font-semibold">Appel lancé • 2:45</span>
          </div>
        );
      default:
        return <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-4 px-4`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isMine
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
        }`}
      >
        {renderContent()}
        <div className={`flex items-center justify-end mt-1 space-x-1 opacity-70`}>
          <span className="text-[10px]">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isMine && <CheckCheck size={12} className={message.isRead ? 'text-cyan-400' : 'text-white/60'} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
