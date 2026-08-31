import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAnalyticsController } from '../controllers/analyticsController.js';

const router = Router();

router.use(authMiddleware);
router.get('/', getAnalyticsController);

export default router;
