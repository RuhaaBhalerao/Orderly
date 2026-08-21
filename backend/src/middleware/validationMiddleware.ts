import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Enhanced validation error handler
 * Formats express-validator errors into a consistent response
 */
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors into field-based structure
    const formattedErrors: Record<string, string> = {};
    errors.array().forEach((err: any) => {
      const field = err.param || 'unknown';
      formattedErrors[field] = err.msg;
    });

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
    return;
  }

  next();
}

/**
 * Validates request body size to prevent DOS attacks
 * Default: 10MB
 */
export function validateBodySize(maxSizeInBytes: number = 10 * 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);

    if (contentLength > maxSizeInBytes) {
      res.status(413).json({
        success: false,
        message: 'Request entity too large',
        error: `Request size exceeds maximum allowed size of ${maxSizeInBytes / 1024 / 1024}MB`,
      });
      return;
    }

    next();
  };
}

/**
 * Validates string length and prevents empty/whitespace-only strings
 * Used in validators chain
 */
export const customValidators = {
  /**
   * Validates email format more strictly
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validates password meets minimum requirements
   * - At least 8 characters
   * - At least one letter
   * - At least one number (optional, for MVP only requires 8 chars)
   */
  isValidPassword: (password: string): boolean => {
    return password.length >= 8;
  },

  /**
   * Validates contract ID format (should be CUID)
   */
  isValidCUID: (id: string): boolean => {
    return /^c[0-9a-z]{24}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  },

  /**
   * Validates date is in future or present
   */
  isFutureOrPresentDate: (dateString: string): boolean => {
    const date = new Date(dateString);
    return date >= new Date();
  },

  /**
   * Validates expiryDate is after effectiveDate
   */
  isValidDateRange: (effectiveDate: string, expiryDate: string): boolean => {
    const start = new Date(effectiveDate);
    const end = new Date(expiryDate);
    return end > start;
  },

  /**
   * Validates risk level
   */
  isValidRiskLevel: (level: string): boolean => {
    return ['Low', 'Medium', 'High', 'Critical'].includes(level);
  },

  /**
   * Validates contract type
   */
  isValidContractType: (type: string): boolean => {
    const validTypes = ['MSA', 'SLA', 'NDA', 'Purchase Agreement', 'Service Agreement', 'Vendor Agreement', 'Other'];
    return validTypes.includes(type);
  },

  /**
   * Validates contract status
   */
  isValidContractStatus: (status: string): boolean => {
    const validStatuses = ['Draft', 'Review', 'Approved', 'Signed', 'Expired', 'Terminated'];
    return validStatuses.includes(status);
  },

  /**
   * Validates string is not empty or whitespace-only
   */
  isNotEmptyString: (str: string): boolean => {
    return typeof str === 'string' && str.trim().length > 0;
  },

  /**
   * Validates string length within limits
   */
  isWithinLength: (str: string, minLength: number, maxLength: number): boolean => {
    return str.length >= minLength && str.length <= maxLength;
  },
};
