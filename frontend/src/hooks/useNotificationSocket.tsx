// src/hooks/useNotificationSocket.ts
import { useEffect, useState } from 'react';

interface NotificationPayload {
  title: string;
  body: string;
  timestamp: number;
}

export function useNotificationSocket() {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4001');

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      try {
        const data: NotificationPayload = JSON.parse(event.data);
        setNotifications((prev) => [data, ...prev]);
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    return () => {
      socket.close();
    };
  }, []);

  return { notifications };
}
