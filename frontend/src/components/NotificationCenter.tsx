// src/components/NotificationCenter.tsx
import React from 'react';
import { useNotificationSocket } from '../hooks/useNotificationSocket';

export const NotificationCenter: React.FC = () => {
  const { notifications } = useNotificationSocket();

  return (
    <div style={{ padding: 16, maxWidth: 400 }}>
      <h2>🔔 Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map((n, i) => (
            <li
              key={i}
              style={{
                background: '#f1f1f1',
                padding: '12px',
                marginBottom: '10px',
                borderRadius: '8px',
              }}
            >
              <strong>{n.title}</strong>
              <p style={{ margin: '4px 0' }}>{n.body}</p>
              <small>{new Date(n.timestamp).toLocaleTimeString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
