import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

import { consumeNotificationMessages } from './rabbit';
import { handleWsConnection, broadcastMessage } from './websocket';
import { logger } from './logger';

import { createNotificationsTable, getNotifications } from './services/notificationRepo';

const PORT = 4001;
const app = express();
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocketServer({ server });

// Store WebSocket clients
const clients: Set<WebSocket> = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  handleWsConnection(ws, clients);
});

// Start consuming from RabbitMQ
consumeNotificationMessages((message: any) => {
  logger.info('Broadcasting message to clients...');
  broadcastMessage(clients, message);
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
