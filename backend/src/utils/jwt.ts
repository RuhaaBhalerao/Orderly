import jwt from 'jsonwebtoken';

// Ensure JWT_SECRET is configured in production/development
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 16) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'CRITICAL: JWT_SECRET is not configured or too short. ' +
      'Set a strong JWT_SECRET (minimum 16 characters) in your .env file.'
    );
  } else {
    console.warn(
      '⚠️  WARNING: JWT_SECRET is not configured or too short. ' +
      'In production, this will cause the application to fail. ' +
      'Set a strong JWT_SECRET (minimum 16 characters) in your .env file.'
    );
  }
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as JwtPayload | null;
  } catch (error) {
    return null;
  }
}
