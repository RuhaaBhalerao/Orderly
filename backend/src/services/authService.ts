import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterPayload, LoginPayload, AuthResponse } from '../types/auth';

/**
 * Register a new user with Employee ID role validation
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const { name, employeeId, email, password, role } = payload;

  if (!employeeId || !employeeId.trim()) {
    throw { status: 400, message: 'Employee ID is required' };
  }

  if (role === 'ADMIN') {
    throw { status: 400, message: 'Admin account cannot be registered publicly' };
  }

  // 1. Find employee in Employee table
  const employee = await prisma.employee.findUnique({
    where: { employeeId: employeeId.trim().toUpperCase() },
  });

  // 2. Verify employee exists
  if (!employee) {
    throw { status: 400, message: 'Invalid employee ID' };
  }

  // 3. Verify employee isActive = true
  if (!employee.isActive) {
    throw { status: 400, message: 'Employee record is inactive' };
  }

  // 4. Verify selected role matches predefined employee role
  if (employee.role !== role) {
    throw {
      status: 400,
      message: 'The selected role does not match the role assigned to this employee ID.',
    };
  }

  // 5. Verify employeeId or email not already registered
  const existingUserByEmpId = await prisma.user.findUnique({
    where: { employeeId: employee.employeeId },
  });

  if (existingUserByEmpId) {
    throw { status: 409, message: 'Employee ID is already registered' };
  }

  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUserByEmail) {
    throw { status: 409, message: 'User with this email already exists' };
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      employeeId: employee.employeeId,
      name: name || employee.name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: employee.role,
      department: employee.department,
    },
  });

  // Log Audit Entry
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      metadata: { employeeId: user.employeeId, role: user.role, department: user.department },
    },
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    department: user.department,
    employeeId: user.employeeId,
  });

  return {
    token,
    user: {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  };
}

/**
 * Login user
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    department: user.department,
    employeeId: user.employeeId,
  });

  return {
    token,
    user: {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      department: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  return user;
}
