import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { uploadMiddleware } from '../middleware/uploadMiddleware';
import {
  getContractsController,
  getContractController,
  createContractController,
  deleteContractController,
} from '../controllers/contractController';

const router = Router();

router.use(authMiddleware);

router.get('/', getContractsController);
router.get('/:id', getContractController);
router.post('/', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), uploadMiddleware.single('file'), createContractController);
router.delete('/:id', requireRoles('PROCUREMENT_OFFICER', 'ADMIN'), deleteContractController);

export default router;
