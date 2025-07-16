import express from 'express';
import amqp from 'amqplib';

const app = express();
const PORT = 4002;

const exchange = 'notifications';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

app.use(express.json());

let channel: amqp.Channel;

async function connectRabbit() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(exchange, 'fanout', { durable: false });
}

app.post('/api/notify', async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' });
  }

  const message = JSON.stringify({ title, body, timestamp: Date.now() });
  channel.publish(exchange, '', Buffer.from(message));
  console.log('[x] Notification sent:', message);

  res.status(200).json({ status: 'Notification sent' });
});

app.listen(PORT, async () => {
  await connectRabbit();
  console.log(`Emitter service running on port ${PORT}`);
});
