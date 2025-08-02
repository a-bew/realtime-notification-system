Delete or Recreate the Exchange with Correct Type via API:

Delete the existing notifications exchange manually
You can do this via:

RabbitMQ Management UI (usually at http://localhost:15672)

Go to the "Exchanges" tab.

Find and delete the notifications exchange.



Restart

docker compose restart notification_service
docker compose restart emitter_service


So here are the correct curl test examples for your setup:
🧍 To notify a single user
bash
Copy
Edit
curl -X POST http://localhost:4002/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123",
    "title": "Direct Notification",
    "body": "Hello user 123!",
    "type": "DIRECT"
  }'
👥 To notify multiple users
bash
Copy
Edit
curl -X POST http://localhost:4002/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["123", "456", "789"],
    "title": "Group Notification",
    "body": "Hello to you all!",
    "type": "GROUP"
  }'
📢 To send to a channel (like admins)
bash
Copy
Edit
curl -X POST http://localhost:4002/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "admins",
    "title": "Admin Alert",
    "body": "New admin task assigned",
    "type": "ALERT"
  }'
🌍 To broadcast to all (no userId, userIds, or channel)
bash
Copy
Edit
curl -X POST http://localhost:4002/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Broadcast Notice",
    "body": "Everyone should see this",
    "type": "INFO"
  }'
✅ Notes
Your emitNotification function publishes to RabbitMQ using topic-based routing, e.g.:

notify.user.123

notify.channel.admins

notify.broadcast