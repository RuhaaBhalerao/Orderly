import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/rbacMiddleware.js';
import {
  createPurchaseOrderController,
  getPurchaseOrdersController,
  getPurchaseOrderByIdController,
  updatePOStatusController,
} from '../controllers/purchaseOrderController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getPurchaseOrdersController);
router.get('/:id', getPurchaseOrderByIdController);
router.post('/', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), createPurchaseOrderController);
router.patch('/:id/status', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), updatePOStatusController);
router.put('/:id/status', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), updatePOStatusController);

export default router;
