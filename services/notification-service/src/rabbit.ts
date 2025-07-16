import amqp from 'amqplib';
import { logger } from './logger';
import { saveNotification } from './services/notificationRepo';

const exchange = 'notifications';

export async function consumeNotificationMessages(callback: (msg: any) => void) {
  let connection;
  let retries = 5;
  const retryDelay = 5000; // 5 seconds

  while (retries > 0) {
    try {
      connection = await amqp.connect(process.env.RABBITMQ_URL || '');
      const channel = await connection.createChannel();

      await channel.assertExchange(exchange, 'fanout', { durable: false });
      const q = await channel.assertQueue('', { exclusive: true });

      await channel.bindQueue(q.queue, exchange, '');

      logger.info('Connected to RabbitMQ and waiting for messages...');

      channel.consume(q.queue, (msg) => {
        if (msg?.content) {
          const message = JSON.parse(msg.content.toString());

           // Save to DB
            saveNotification(message).catch((err: any) => {
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
