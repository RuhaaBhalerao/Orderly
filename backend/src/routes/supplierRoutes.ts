import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import {
  getSuppliersController,
  getSupplierByIdController,
  createSupplierController,
  updateSupplierController,
} from '../controllers/supplierController';

const router = Router();

router.use(authMiddleware);

router.get('/', getSuppliersController);
router.get('/:id', getSupplierByIdController);
router.post('/', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), createSupplierController);
router.patch('/:id', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), updateSupplierController);
router.put('/:id', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), updateSupplierController);

export default router;
