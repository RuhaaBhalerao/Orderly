import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { AuthRequest } from '../types/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.status(200).json(notification);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

router.post('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

export default router;
