'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI, getToken, getUser } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
}

export type { AuthContextType }

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = getToken()
    const storedUser = getUser()
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      
      if (response.error) {
        return { error: response.error }
      }

      // Token is already stored by authAPI.login
      setToken(getToken())
      setUser(getUser())
      
      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      return { error: errorMessage }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(name, email, password)
      
      if (response.error) {
        return { error: response.error }
      }

      // Token is already stored by authAPI.register
      setToken(getToken())
      setUser(getUser())
      
      return {}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      return { error: errorMessage }
    }
  }

  const logout = () => {
    authAPI.logout()
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
