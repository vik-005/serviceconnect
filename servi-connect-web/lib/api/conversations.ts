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

export const sendMessage = async (conversationId: number, content: string, type: string = 'text', mediaUrl?: string) => {
  const { data } = await api.post<Message>(`/api/conversations/${conversationId}/messages`, {
    content,
    type,
    mediaUrl
  });
  return data;
};

export const uploadMedia = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/api/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data; // { url, type, duration? }
};

export const sendTyping = async (conversationId: number, isTyping: boolean) => {
  await api.post(`/api/conversations/${conversationId}/typing`, { isTyping });
};
