import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterPayload, LoginPayload, AuthResponse } from '../types/auth';

/**
 * Register a new user
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const { name, email, password } = payload;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser)      throw {
        status: 409,
        message: 'User with this email already exists',
      };

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

/**
 * Login user
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { email, password } = payload;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw {
      status: 401,
      message: 'Invalid email or password',
    };
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw {
      status: 401,
      message: 'Invalid email or password',
    };
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw {
      status: 404,
      message: 'User not found',
    };
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
