import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { AuthRequest } from '../types/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true, employeeId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.status(200).json(logs);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
});

export default router;
