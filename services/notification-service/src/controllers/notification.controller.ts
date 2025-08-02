import { notificationRepo } from '@/services/notificationRepo';
import { Request, Response } from 'express';

export async function getNotifications (req: Request, res: Response) {
  try {

    const user  = (req as any).user;
    if (!user.id) return res.status(400).json({ message: 'Missing user.id' });
    const notifications = await notificationRepo.getByUserId(user.id as string);
    res.json(notifications);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: 'Internal server error' });

  }
};