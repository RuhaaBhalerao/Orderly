import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import {
  createPurchaseOrderController,
  getPurchaseOrdersController,
  getPurchaseOrderByIdController,
  updatePOStatusController,
} from '../controllers/purchaseOrderController';

const router = Router();

router.use(authMiddleware);

router.get('/', getPurchaseOrdersController);
router.get('/:id', getPurchaseOrderByIdController);
router.post('/', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), createPurchaseOrderController);
router.patch('/:id/status', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), updatePOStatusController);
router.put('/:id/status', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), updatePOStatusController);

export default router;
