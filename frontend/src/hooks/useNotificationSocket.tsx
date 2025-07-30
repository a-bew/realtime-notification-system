// src/hooks/useNotificationSocket.ts
import { useEffect, useRef, useState } from 'react';

interface NotificationPayload {
  title: string;
  body: string;
  timestamp: number;
}

export function useNotificationSocket() {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const userId = params.get('userId') || '';

  useEffect(() => {

    // ✅ Fetch past notifications from DB
    const loadHistory = async () => {
      try {
        const res = await fetch(`http://localhost:4001/api/notifications?userId=${userId}`);
        const data = await res.json();
        setNotifications(data.reverse()); // latest at top
      } catch (err) {
        console.error('❌ Failed to fetch notification history', err);
      }
    };


    const setupWebSocket = () => {
      if (socketRef.current) socketRef.current.close();


      // const socket = new WebSocket('ws://localhost:4001');
      const socket = new WebSocket(`ws://localhost:4001?userId=${userId}`);
      socketRef.current = socket;

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
    }

    loadHistory();
    setupWebSocket();

    return () => {

      if (socketRef.current) socketRef.current.close();
    };
  }, [userId]);

  return { notifications };
}
