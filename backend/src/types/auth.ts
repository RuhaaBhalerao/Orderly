import { Request } from 'express';

/**
 * Extended Express Request with authenticated user
 */
export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  userDepartment?: string;
  employeeId?: string;
}

/**
 * Auth response structure
 */
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
}

/**
 * User registration payload
 */
export interface RegisterPayload {
  name: string;
  employeeId: string;
  email: string;
  password: string;
  role: string; // REQUESTER, MANAGER, PROCUREMENT_OFFICER
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
