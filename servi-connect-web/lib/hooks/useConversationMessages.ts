import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversationMessages, sendMessage, uploadMedia } from '../api/conversations';
import { Message } from '../types/message';
import { useCallback } from 'react';

export const useConversationMessages = (conversationId: number | null | undefined) => {
  const queryClient = useQueryClient();

  // Fetch messages for the active conversation
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['conversationMessages', conversationId],
    queryFn: () => getConversationMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 30000, // 30 seconds
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async ({ content, type = 'text', file }: { content: string; type?: string; file?: File }) => {
      if (!conversationId) throw new Error('No conversation selected');
      return sendMessage(conversationId, content, type, file);
    },
    onSuccess: (newMessage) => {
      // Update the messages cache optimistically
      queryClient.setQueryData(['conversationMessages', conversationId], (old: Message[] = []) => [
        ...old,
        newMessage,
      ]);
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['conversationMessages', conversationId] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });

  // Upload media mutation (Deprecated, kept for type compatibility but not used)
  const uploadMutation = { isPending: false };

  // Send text message
  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      return sendMutation.mutateAsync({ content: text, type: 'text' });
    },
    [sendMutation]
  );

  // Send media message (audio, video, image)
  const sendMediaMessage = useCallback(
    async (file: File, mediaType: 'audio' | 'video' | 'image') => {
      try {
        return await sendMutation.mutateAsync({
          content: `Médias: ${mediaType}`,
          type: mediaType,
          file: file,
        });
      } catch (error) {
        console.error('Failed to send media:', error);
        throw error;
      }
    },
    [sendMutation]
  );

  return {
    messages,
    isLoading,
    error,
    sendTextMessage,
    sendMediaMessage,
    isSending: sendMutation.isPending,
    isUploading: uploadMutation.isPending,
  };
};
