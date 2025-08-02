# 🔔 Real-Time Notification System (Microservices + WebSocket + RabbitMQ Topic Exchange)

## 🧩 Overview

A scalable notification delivery system using:

- **Microservices in TypeScript**
- **RabbitMQ (Topic Exchange)** for flexible message routing
- **WebSocket** for real-time delivery
- **MySQL** for persistence
- **JWT-based Authentication**
- **React Frontend** for interaction

---

## 📁 Project Structure

```
realtime-notification-system/
├── frontend/                  # React-based UI (JWT login + WebSocket)
├── services/
│   ├── auth-service/          # User registration & login
│   │   └── src/
│   │       └── index.ts
│   ├── emitter-service/       # Publishes to RabbitMQ topic exchange
│   │   └── src/
│   │       ├── index.ts
│   │       └── rabbitmq.ts
│   └── notification-service/  # WebSocket + consumer + DB store
│       └── src/
│           ├── index.ts
│           ├── rabbitmq.ts
│           ├── db.ts
│           └── services/
│               └── notificationRepo.ts
└── docker-compose.yml
```

---

## 🔐 Auth Flow

- `auth-service` handles:
  - `POST /api/auth/signup`: email & password → new user
  - `POST /api/auth/login`: sets HTTP-only JWT cookie
  - `GET /api/auth/logout`: logout

- `notification-service` uses this cookie to authenticate WebSocket clients.

---

## 🔄 Notification Flow

1. Client logs in → cookie is set.
2. WebSocket connects → JWT is extracted & verified.
3. Backend triggers `POST /api/notify` (via `emitter-service`)
4. Emitter decides **routing key** dynamically:
   ```ts
   const routingKey = payload.userId
     ? `notify.user.${payload.userId}`
     : payload.channel
     ? `notify.channel.${payload.channel}`
     : 'notify.broadcast';
   ```
5. Publishes to RabbitMQ **topic exchange**.
6. `notification-service` listens with binding keys like:
   - `notify.user.*`
   - `notify.channel.*`
   - `notify.broadcast`
7. Matched messages are sent to respective WebSocket clients and saved to MySQL.

---

## ✨ Emitter Service Logic

```ts
export async function emitNotification(payload: NotificationPayload): Promise<void> {
    const ch = await connectRabbit();
    const routingKey = payload.userId
        ? `notify.user.${payload.userId}`
        : payload.channel
        ? `notify.channel.${payload.channel}`
        : 'notify.broadcast';

    const msg = Buffer.from(JSON.stringify(payload));

    if (payload.userIds?.length) {
        for (const userId of payload.userIds) {
            ch.publish(exchange, `notify.user.${userId}`, Buffer.from(JSON.stringify({
                ...payload,
                userId,
            })));
        }
    } else {
        ch.publish(exchange, routingKey, msg, { persistent: true });
    }

    logger.info(`📬 Sent notification to ${routingKey}`);
}
```

---

## 🧪 RabbitMQ Topic Exchange Patterns

| Routing Key             | Meaning                                 |
|------------------------|------------------------------------------|
| `notify.user.123`      | Specific user notification               |
| `notify.channel.admin` | Channel-based (e.g., admin/moderator)    |
| `notify.broadcast`     | Global/system-wide notification          |

Consumers bind with patterns:
- `notify.user.*`
- `notify.channel.*`
- `notify.*`

---

## 💻 Frontend Flow

- React app:
  - Login form → submits to `auth-service`
  - On login, JWT cookie is stored
  - Establishes WebSocket to `notification-service`
  - Receives real-time messages

---

## 🐳 Docker Compose

```bash
docker-compose up --build
```

### Ports

| Service              | Port               |
|----------------------|--------------------|
| `auth-service`       | `4000`             |
| `notification-service` | `4001`          |
| `emitter-service`    | `4002`             |
| RabbitMQ UI          | `15672` (guest/guest) |
| MySQL                | `3307`             |

---

## ✅ Test Scenario

1. Visit frontend → register/login
   ```bash
   curl -X POST http://localhost:4000/api/auth/signup \
   -H "Content-Type: application/json" \
   -d '{
      "email": "test@example.com",
      "password": "test1234"
   }'
   ```

   or if already signed up:
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{
      "email": "test@example.com",
      "password": "test1234"
   }'
   ```

2. Client is auto-authenticated via JWT
3. WebSocket opens
4. Send POST to emitter:
   ```bash
      curl -X POST http://localhost:4002/api/notify      
      -H "Content-Type: application/json"      
      -d '{ "title": "Alert!", "body": "New message", "userId": "123", "type": "GENERIC" }'
   ```

   Send a batch from backend:
   ```bash
   curl -X POST http://localhost:4002/api/notify \
   -H "Content-Type: application/json" \
   -d '{
      "userIds": ["123", "456"],
      "title": "Test Broadcast",
      "body": "Hello multiple users!",
      "type": "BATCH"
   }'
   ```

5. WebSocket client receives it instantly.
