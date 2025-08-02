# realtime-notification-system

# 🔔 Real-Time Notification System (Microservices + WebSocket + RabbitMQ)

This is a fully-featured real-time notification system using:

- **Express + TypeScript** Microservices
- **RabbitMQ (Fanout Exchange)** for event-driven communication
- **WebSocket** for cross-browser, real-time notification delivery
- **MySQL** for persistent storage
- **Docker Compose** for environment orchestration

---

## 📦 Microservices

### 1. `notification-service`
- Consumes messages from RabbitMQ `fanout` exchange
- Broadcasts to connected WebSocket clients
- Stores all notifications to MySQL
- Supports `userId`-scoped notification delivery

### 2. `emitter-service`
- Sends messages to RabbitMQ exchange via `/notify` endpoint
- Payload must include `title`, `body`, and optional `userId`

---

## 🧱 System Architecture

Frontend (React) ⇄ WebSocket ⇄ Notification Service ⇄ RabbitMQ ⇄ Emitter Service
⇡
MySQL (Persistent Storage)


---

## 🧪 Features

- [x] Real-time notification delivery over WebSocket
- [x] Cross-browser updates
- [x] RabbitMQ Fanout-based pub/sub architecture
- [x] Message persistence (MySQL)
- [x] User-based scoped notification (via `userId`)
- [ ] In-memory pub/sub fallback (optional)
- [ ] Authenticated WebSocket via JWT (optional)

---

## 🐳 Docker Setup

Ensure Docker is installed, then run:

```bash
docker-compose up --build
```

Default exposed ports:

   - notification-service: http://localhost:4001

   - emitter-service: http://localhost:4002

   - RabbitMQ Dashboard: http://localhost:15672 (user: guest, pass: guest)

   - MySQL: localhost:3307

Test Flow

 1. Open multiple tabs at React App, each with a different userId via WebSocket.

 2. Trigger a notification via:

 3. curl -X POST http://localhost:4002/notify \
    -H "Content-Type: application/json" \
    -d '{"title":"Hello", "body":"World", "userId":"123"}'
    Only the client with userId=123 receives it in real time.

 4.  Notification is saved to MySQL.

## Structure

 notification-service/
  ├── src/
  │   ├── index.ts
  │   ├── rabbitmq.ts
  │   ├── services/notificationRepo.ts
  │   ├── db.ts
  └── Dockerfile

emitter-service/
  ├── src/
  │   ├── index.ts
  │   └── rabbitmq.ts
  └── Dockerfile


<!-- emitNotification("123", { title: "Hello", body: "User 123 only" });
 -->