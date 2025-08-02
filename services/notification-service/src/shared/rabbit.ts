import amqp from 'amqplib';
import { logger } from '@/utils/logger';
import { notificationRepo } from '@/services/notificationRepo';

const exchange = 'notifications';

export async function consumeNotificationMessages(callback: (msg: any) => void) {
  let connection;
  let retries = 5;
  const retryDelay = 5000; // 5 seconds

  while (retries > 0) {
    try {
      connection = await amqp.connect(process.env.RABBITMQ_URL || '');
      const channel = await connection.createChannel();

      await channel.assertExchange(exchange, 'topic', { durable: true });
      const q = await channel.assertQueue('', { exclusive: true });

      await channel.bindQueue(q.queue, exchange, 'notify.user.*');
      await channel.bindQueue(q.queue, exchange, 'notify.channel.*');
      await channel.bindQueue(q.queue, exchange, 'notify.broadcast'); // Optional global
      logger.info('🎧 Waiting for RabbitMQ topic messages...');

      channel.consume(q.queue, (msg) => {
        if (msg?.content) {
            const message = JSON.parse(msg.content.toString());

           // Save to DB
            notificationRepo.saveNotification(message).catch((err: any) => {
            logger.error('❌ Failed to save notification to DB:', err);
            });

          callback(message);
        }
      }, { noAck: true });

      // Connection succeeded, break out of retry loop
      break;
    } catch (error: any) {
      retries--;
      logger.error(`RabbitMQ connection failed. ${retries} retries left. Error: ${error.message}`);
      
      if (retries === 0) {
        throw error;
      }
      
      await new Promise(res => setTimeout(res, retryDelay));
    }
  }
}


export async function consumeNotificationMessagesForUser(
  userId: string,
  channels: string[] = [],
  callback: (msg: any) => void
) {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || '');
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, 'topic', { durable: true });

  // Dedicated, durable queue per user (you could make this persistent if desired)
  const q = await channel.assertQueue(`user-queue-${userId}`, {
    durable: true,
    exclusive: false,
  });

  // Bind user-specific key
  await channel.bindQueue(q.queue, exchange, `notify.user.${userId}`);

  // Bind to all joined channels
  for (const ch of channels) {
    await channel.bindQueue(q.queue, exchange, `notify.channel.${ch}`);
  }

  // Optional: subscribe to broadcast messages
  await channel.bindQueue(q.queue, exchange, `notify.broadcast`);

  logger.info(`🎧 Listening for notifications for user=${userId}...`);

  channel.consume(
    q.queue,
    async (msg) => {
      if (msg?.content) {
        const message = JSON.parse(msg.content.toString());

        // Save to DB
        await notificationRepo.saveNotification(message).catch((err: any) => {
          logger.error('❌ Failed to save notification to DB:', err);
        });

        callback(message);
      }
    },
    { noAck: true }
  );
}


