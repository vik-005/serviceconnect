import { useEffect } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { toast } from 'sonner';

const MERCURE_URL = process.env.NEXT_PUBLIC_MERCURE_URL || 'http://localhost:3000/.well-known/mercure';

export const useNotifications = (userId?: number) => {
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!userId) return;

    const url = new URL(MERCURE_URL);
    url.searchParams.append('topic', `/notifications/${userId}`);
    
    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addNotification(data);
      toast(data.title, {
        description: data.message,
      });
    };

    return () => {
      eventSource.close();
    };
  }, [userId, addNotification]);
};
