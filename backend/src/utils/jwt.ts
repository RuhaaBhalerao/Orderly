import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

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
