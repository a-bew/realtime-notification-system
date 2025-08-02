import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';

interface NotificationPayload {
  title: string;
  body: string;
  timestamp: number;
}

export function useNotificationSocket() {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const user = useAuth();

  useEffect(() => {
    let isUnmounted = false;

    // ✅ Fetch past notifications from DB
    const loadHistory = async () => {
      try {
        const res = await fetch('http://localhost:4001/api/notifications', {
                            method: 'GET',
                            credentials: 'include',
                          })
        // fetch(`http://localhost:4001/api/notifications?userId=${userId}`
          // ,{headers: { Authorization: `Bearer ${token}` }}
        // );
        const data = await res.json();
        console.log("data", data)
       if (!isUnmounted) setNotifications(data.reverse()); // latest at top
      } catch (err) {
        console.error('❌ Failed to fetch notification history', err);
      }
    };

    const setupWebSocket = () => {
      if (socketRef.current) {
        socketRef.current.close();
      }

      const ws = new WebSocket(`ws://${window.location.hostname}:4001`); // don't pass token in query param
      // const ws = new WebSocket(`ws://localhost:4001?token=${token}`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data: NotificationPayload = JSON.parse(event.data);
          console.log('🔔 Received notification:', data);
          setNotifications((prev) => [data, ...prev]);
        } catch (err) {
          console.error('❌ Failed to parse message', err);
        }
      };

      ws.onerror = (err) => {
        console.error('⚠️ WebSocket error', err);
      };

      ws.onclose = () => {
        if (isUnmounted) return;
        console.warn('🔌 WebSocket closed, retrying in 1s...');
        retryTimeoutRef.current = setTimeout(() => {
          setupWebSocket(); // safe retry
        }, 1000);
      };
    };

    loadHistory();
    setupWebSocket();

    return () => {
      isUnmounted = true;
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [user.email]);

  return { notifications };
}
