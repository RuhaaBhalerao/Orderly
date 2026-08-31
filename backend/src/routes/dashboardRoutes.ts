import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getDashboardController } from '../controllers/dashboardController.js';

const router = Router();

router.use(authMiddleware);
router.get('/', getDashboardController);

export default router;
