import { Router } from 'express';
import { body } from 'express-validator';
import { uploadMiddleware } from '../middleware/uploadMiddleware';
import { uploadContractController } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * POST /api/contracts/upload
 * Upload a PDF contract with metadata
 */
router.post(
  '/upload',
  authMiddleware,
  uploadMiddleware.single('file'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('vendor').trim().notEmpty().withMessage('Vendor is required'),
    body('status').trim().notEmpty().withMessage('Status is required'),
    body('riskLevel').trim().notEmpty().withMessage('Risk level is required'),
    body('contractType').trim().notEmpty().withMessage('Contract type is required'),
    body('effectiveDate').isISO8601().withMessage('Valid effective date is required'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
    body('summary').trim().optional(),
  ],
  uploadContractController
);

export default router;
