import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getDashboardController } from '../controllers/dashboardController';

const router = Router();

router.use(authMiddleware);
router.get('/', getDashboardController);

export default router;
