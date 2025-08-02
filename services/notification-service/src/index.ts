// Enables alias for production runtime
import 'module-alias/register';
import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import { WebSocketServer, WebSocket } from 'ws';
import { logger } from './utils/logger';
import { notificationRepo } from './services/notificationRepo';
import cors from 'cors';
import { consumeNotificationMessagesForUser } from './shared/rabbit';
import { authenticateSocketConnection } from './middleware/ws-auth';
import notificationRoute from './routes/notification.route';
const PORT = 4001;
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));

app.use(cookieParser()); // <--- must come before routes
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/** WebSocket registries */
const clientsByUser: Map<string, Set<WebSocket>> = new Map();
const clientsByChannel: Map<string, Set<WebSocket>> = new Map();

/** ---------- WebSocket handshake ---------- **/
wss.on('connection', (ws: WebSocket, req) => {

  const url = new URL(req.url || '', `http://${req.headers.host}`);

  // const userId = url.searchParams.get('userId') ?? undefined;
  const isAuthenticated = authenticateSocketConnection(ws, req);

  const channelsRaw = url.searchParams.get('channels') || '';
  const channels = channelsRaw.split(',').map(ch => ch.trim()).filter(Boolean);

  if (!isAuthenticated) return;

  // Register WebSocket under userId
  const userId = ws.userId as string;
  if (!clientsByUser.has(userId)) clientsByUser.set(userId, new Set());
  clientsByUser.get(userId)!.add(ws);
  logger.info(`👤 WS connected (userId = ${userId})`);

  // Register WebSocket under each channel
  channels.forEach(channel => {
    if (!clientsByChannel.has(channel)) clientsByChannel.set(channel, new Set());
    clientsByChannel.get(channel)!.add(ws);
    logger.info(`🔔 WS subscribed to channel "${channel}"`);
  });

  // Consume RabbitMQ messages for user + their channels
  consumeNotificationMessagesForUser(userId, channels, async (message) => {
    // Persist to MySQL
    await notificationRepo.saveNotification(message).catch((err) =>
      logger.error('DB save failed', err)
    );

    // Dispatch message to correct recipients
    if (message.userId) {
      broadcastToUser(message.userId, message);
    } else if (message.channel) {
      broadcastToChannel(message.channel, message);
    } else {
      broadcastToAll(message);
    }
  });

  // Cleanup on disconnect
  ws.on('close', () => {
    const userSet = clientsByUser.get(userId);
    userSet?.delete(ws);
    if (userSet?.size === 0) clientsByUser.delete(userId);

    channels.forEach(channel => {
      const set = clientsByChannel.get(channel);
      set?.delete(ws);
      if (set?.size === 0) clientsByChannel.delete(channel);
    });

    logger.info(`❌ WS disconnected (userId = ${userId})`);
  });
});

/** ---------- Broadcast helpers ---------- **/
function send(json: any, set?: Set<WebSocket>) {
  if (!set) return;
  const payload = JSON.stringify(json);
  set.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  });
}

function broadcastToUser(userId: string, msg: any) {
  send(msg, clientsByUser.get(userId));
}

function broadcastToChannel(channel: string, msg: any) {
  send(msg, clientsByChannel.get(channel));
}

function broadcastToAll(msg: any) {
  [...clientsByUser.values(), ...clientsByChannel.values()].forEach((set) =>
    send(msg, set)
  );
}

/** ---------- REST: fetch history ---------- **/
app.use(notificationRoute);

/** ---------- Boot ---------- **/
(async () => {
  await notificationRepo.createNotificationsTable();
  server.listen(PORT, () =>
    logger.info(`🚀 Notification service listening on ${PORT}`)
  );
})();
