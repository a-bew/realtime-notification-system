// Enables alias for production runtime
import 'module-alias/register';
import express from 'express';
import amqp from 'amqplib';
import cors from 'cors';
import { logger } from './utils/logger';
import { closeRabbitConnection, emitNotification, NotificationPayload } from './shared/rabbit';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 4002;

const exchange = 'notifications';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
app.use(cookieParser()); // <--- must come before routes

app.use(cors({
  credentials: true, 
  origin: 'http://localhost:5173',
}));

app.use(express.json());

let channel: amqp.Channel;

async function connectRabbit() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(exchange, 'topic', { durable: true });
}

app.post('/api/notify', async (req, res) => {
    try {

    const {
      userId,
      userIds,
      title,
      body,
      type = 'GENERIC',
      data,
      service = 'custom-service'
    } = req.body;

    if ((!userId && !userIds?.length) || !title || !body) {
      return res.status(400).json({ error: 'Missing userId(s), title, or body' });
    }

    const payload: NotificationPayload = {
      title,
      body,
      type,
      data,
      service,
      ...(userId ? { userId } : {}),
      ...(userIds ? { userIds } : {}),
    };

    await emitNotification(payload);      // const message = JSON.stringify({ title, body, timestamp: Date.now(), userId });
      // channel.publish(exchange, '', Buffer.from(message));
      // console.log('[x] Notification sent:', message);

    res.status(200).json({ status: 'Notification sent' });

   } catch (err: any) {

    console.error('Notification error:', err.message);

    res.status(500).json({ error: 'Failed to send notification' });

  }
});

app.listen(PORT, async () => {
  await connectRabbit();
  console.log(`Emitter service running on port ${PORT}`);
});


process.on('SIGINT', async () => {
  logger.info('Gracefully shutting down...');
  await closeRabbitConnection();
  process.exit(0);
});
