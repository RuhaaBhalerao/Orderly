import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getAnalyticsController } from '../controllers/analyticsController';

const router = Router();

router.use(authMiddleware);
router.get('/', getAnalyticsController);

export default router;
