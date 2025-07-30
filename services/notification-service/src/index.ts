import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

import { consumeNotificationMessages } from './rabbit';
import { broadcastMessageToUser } from './websocket';
import { logger } from './logger';
import cors from 'cors';

import { createNotificationsTable, getNotifications } from './services/notificationRepo';

const PORT = 4001;
const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

// WebSocket Server
const wss = new WebSocketServer({ server });

// Store WebSocket clients
// const clients: Set<WebSocket> = new Set();
const clientsByUser: Map<string, Set<WebSocket>> = new Map();

// WebSocket URL: ws://localhost:4001?userId=123
wss.on('connection', (ws: WebSocket, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    ws.close(1008, 'Missing userId');
    return;
  }

  if (!clientsByUser.has(userId)) {
    clientsByUser.set(userId, new Set());
  }

  clientsByUser.get(userId)!.add(ws);

  logger.info(`👤 WebSocket connected: userId=${userId}`);

  ws.on('close', () => {
    clientsByUser.get(userId)?.delete(ws);
    logger.info(`❌ Disconnected: userId=${userId}`);
  });
});

// Start consuming from RabbitMQ
consumeNotificationMessages((message: any) => {
  logger.info('Broadcasting message to clients...');
  // broadcastMessage(clientsByUser, message);
  broadcastMessageToUser(clientsByUser, message.userId, message);
});

app.get('/api/notifications', async (req, res) => {
  const rows = await getNotifications(req.query.userId as string);
  res.json(rows);
});

(async () => {
  await createNotificationsTable(); // 👈 Create table if it doesn't exist

  // Then start express + WebSocket server...
  server.listen(PORT, () => {
    logger.info(`🚀 Notification service listening on port ${PORT}`);
  });
})();