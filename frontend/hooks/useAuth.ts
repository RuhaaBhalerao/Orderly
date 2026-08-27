'use client'

import { useAuthContext, type AuthContextType } from '@/context/AuthContext'

/**
 * useAuth hook for accessing authentication state and functions
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth()
 */
export function useAuth(): AuthContextType {
  return useAuthContext()
}
