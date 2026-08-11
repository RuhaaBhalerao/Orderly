import { Request } from 'express';

/**
 * Extended Express Request with authenticated user
 */
export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Auth response structure (matches frontend expectations)
 */
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * User registration payload
 */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/**
 * User login payload
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string>;
}
