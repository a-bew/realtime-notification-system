import { query } from '../db';
import { logger } from '../logger';

export async function createNotificationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      userId VARCHAR(255),
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await query(sql);
  logger.info('✅ notifications table is ready');
}


type Notification = {
  title: string;
  body: string;
  userId?: string;
  timestamp?: string;
};

export async function saveNotification(notification: Notification) {
  const { title, body, userId } = notification;

  const sql = `
    INSERT INTO notifications (title, body, userId)
    VALUES (?, ?, ?)
  `;

  await query(sql, [title, body, userId || null]);
}

export async function getNotifications(userId: string) {
  const sql = `
    SELECT * FROM notifications WHERE userId = ?
  `;
  const notifications = await query(sql, [userId]);
  return notifications;
}

