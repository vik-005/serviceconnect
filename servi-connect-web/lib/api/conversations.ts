import api from './axios';
import { Conversation, Message } from '../types/message';

export const getConversations = async () => {
  const { data } = await api.get<Conversation[]>('/api/conversations');
  return data;
};

export const getConversationMessages = async (id: string | number) => {
  const { data } = await api.get<Message[]>(`/api/conversations/${id}/messages`);
  return data;
};

export const createConversation = async (providerId: number) => {
  const { data } = await api.post<Conversation>('/api/conversations', { providerId });
  return data;
};

export const sendMessage = async (conversationId: number, content: string, type: string = 'text', file?: File) => {
  if (file) {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('type', type);
    formData.append('media', file);
    
    const { data } = await api.post<Message>(`/api/conversations/${conversationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }

  const { data } = await api.post<Message>(`/api/conversations/${conversationId}/messages`, {
    content,
    type
  });
  return data;
};

// uploadMedia is deprecated as media is sent directly with the message.
export const uploadMedia = async (file: File) => {
  throw new Error('Not implemented, use sendMessage with file directly');
};

export const sendTyping = async (conversationId: number, isTyping: boolean) => {
  await api.post(`/api/conversations/${conversationId}/typing`, { isTyping });
};
