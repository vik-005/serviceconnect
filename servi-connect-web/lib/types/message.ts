import { User } from './user';

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'call_log';

export interface Message {
  id: number;
  senderId: number;
  content: string;
  type: MessageType;
  mediaUrl?: string;
  duration?: number; // For audio/video
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: number;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}
