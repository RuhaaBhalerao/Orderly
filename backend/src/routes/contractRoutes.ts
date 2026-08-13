import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getContractsController,
  getContractController,
  createContractController,
  updateContractController,
  deleteContractController,
} from '../controllers/contractController';
import { uploadMiddleware } from '../middleware/uploadMiddleware';
import { uploadContractController } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware to all contract routes
router.use(authMiddleware);

/**
 * GET /api/contracts
 * Get all contracts for authenticated user
 */
router.get('/', getContractsController);

/**
 * GET /api/contracts/:id
 * Get single contract
 */
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Contract ID is required')],
  getContractController
);

/**
 * POST /api/contracts
 * Create new contract
 */
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('vendor').trim().notEmpty().withMessage('Vendor is required'),
    body('status').trim().notEmpty().withMessage('Status is required'),
    body('riskLevel').trim().notEmpty().withMessage('Risk level is required'),
    body('contractType')
      .trim()
      .notEmpty()
      .withMessage('Contract type is required'),
    body('effectiveDate')
      .isISO8601()
      .withMessage('Valid effective date is required'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
    body('summary').trim().optional(),
    body('pdfPath').trim().optional(),
  ],
  createContractController
);

/**
 * POST /api/contracts/upload
 * Upload PDF contract with automatic text extraction
 */
router.post(
  '/upload',
  uploadMiddleware.single('file'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('vendor').trim().notEmpty().withMessage('Vendor is required'),
    body('status').trim().notEmpty().withMessage('Status is required'),
    body('riskLevel').trim().notEmpty().withMessage('Risk level is required'),
    body('contractType').trim().notEmpty().withMessage('Contract type is required'),
    body('effectiveDate')
      .isISO8601()
      .withMessage('Valid effective date is required'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
    body('summary').trim().optional(),
  ],
  uploadContractController
);

/**
 * PUT /api/contracts/:id
 * Update contract
 */
router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('Contract ID is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('vendor').trim().notEmpty().withMessage('Vendor is required'),
    body('status').trim().notEmpty().withMessage('Status is required'),
    body('riskLevel').trim().notEmpty().withMessage('Risk level is required'),
    body('contractType')
      .trim()
      .notEmpty()
      .withMessage('Contract type is required'),
    body('effectiveDate')
      .isISO8601()
      .withMessage('Valid effective date is required'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
    body('summary').trim().optional(),
    body('pdfPath').trim().optional(),
  ],
  updateContractController
);

/**
 * DELETE /api/contracts/:id
 * Delete contract
 */
router.delete(
  '/:id',
  [param('id').notEmpty().withMessage('Contract ID is required')],
  deleteContractController
);

export default router;
