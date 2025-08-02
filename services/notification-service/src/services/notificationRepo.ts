import { query } from '@/shared/db';
import { logger } from '@/utils/logger';


type Notification = {
  title: string;
  body: string;
  userId?: string;
  timestamp?: string;
};
export const notificationRepo = {
  createNotificationsTable: async function() {
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
  },
  saveNotification: async function(notification: Notification) {
    const { title, body, userId } = notification;
  
    const sql = `
      INSERT INTO notifications (title, body, userId)
      VALUES (?, ?, ?)
    `;
  
    await query(sql, [title, body, userId || null]);
  },
  getByUserId: async function(userId: string) {
    const sql = `
      SELECT * FROM notifications WHERE userId = ?
    `;
    const notifications = await query(sql, [userId]);
    return notifications;
  },

}
