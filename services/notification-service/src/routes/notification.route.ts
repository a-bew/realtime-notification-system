import { getNotifications } from '@/controllers/notification.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { Router } from 'express';

const router = Router();

router.get('/api/notifications', authenticate, getNotifications);

export default router;
