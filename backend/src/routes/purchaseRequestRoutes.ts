import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/rbacMiddleware.js';
import {
  createPurchaseRequestController,
  getPurchaseRequestsController,
  getPurchaseRequestByIdController,
  approvePurchaseRequestController,
  rejectPurchaseRequestController,
  compareSuppliersController,
  selectSupplierController,
} from '../controllers/purchaseRequestController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getPurchaseRequestsController);
router.post('/', requireRoles('REQUESTER', 'ADMIN'), createPurchaseRequestController);
router.get('/:id', getPurchaseRequestByIdController);

router.post('/:id/approve', requireRoles('MANAGER', 'ADMIN'), approvePurchaseRequestController);
router.post('/:id/reject', requireRoles('MANAGER', 'ADMIN'), rejectPurchaseRequestController);

router.get('/:id/compare-suppliers', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), compareSuppliersController);
router.post('/:id/compare-suppliers', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), compareSuppliersController);
router.post('/:id/select-supplier', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), selectSupplierController);

export default router;
