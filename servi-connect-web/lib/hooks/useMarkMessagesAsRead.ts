import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const markConversationMessagesAsRead = async (conversationId: number) => {
  const { data } = await api.patch(`/api/conversations/${conversationId}/messages/read`);
  return data;
};

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: number) => markConversationMessagesAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      // Invalidate messages cache to refetch with updated read status
      queryClient.invalidateQueries({ 
        queryKey: ['conversationMessages', conversationId] 
      });
    },
    onError: (error) => {
      console.error('Failed to mark messages as read:', error);
    },
  });
};
