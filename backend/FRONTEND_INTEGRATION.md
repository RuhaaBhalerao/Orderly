# Frontend Integration Guide

Complete guide for connecting your Next.js frontend to the Procure AI Spring Boot backend.

## Overview

The Next.js frontend will communicate with the Spring Boot backend using REST API calls. Here's how to set it up.

## 1. Create API Client Configuration

Create a new file `frontend/lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export interface AuthTokenResponse {
  token: string
  id: string
  name: string
  email: string
}

/**
 * Register a new user
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthTokenResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Registration failed')
  }

  return response.json()
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthTokenResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Login failed')
  }

  return response.json()
}

/**
 * Get current user (protected endpoint)
 */
export async function getCurrentUser(token: string): Promise<AuthTokenResponse> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to get current user')
  }

  return response.json()
}

/**
 * Make authenticated API request
 */
export async function fetchWithAuth(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
}
```

Update `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## 2. Create Auth Context Hook

Create `frontend/lib/useAuth.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'
import { loginUser, registerUser, getCurrentUser, AuthTokenResponse } from './api'

export interface AuthUser {
  id: string
  name: string
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      // Verify token with backend
      verifyToken(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = useCallback(async (authToken: string) => {
    try {
      const userData = await getCurrentUser(authToken)
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
      })
    } catch (err) {
      // Token invalid, clear it
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await loginUser(email, password)
        setToken(response.token)
        setUser({
          id: response.id,
          name: response.name,
          email: response.email,
        })
        localStorage.setItem('auth_token', response.token)
        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await registerUser(name, email, password)
        setToken(response.token)
        setUser({
          id: response.id,
          name: response.name,
          email: response.email,
        })
        localStorage.setItem('auth_token', response.token)
        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }, [])

  return {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  }
}
```

## 3. Update Login Page

Modify `frontend/app/page.tsx` to use the API:

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/lib/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Procure AI</h1>
              <p className="text-xs text-gray-500">Contract Intelligence</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center mb-3">
              Demo credentials:
            </p>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs">
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> demo@acme.com
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Password:</span> demo123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 4. Setup Environment Variables

In `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## 5. Start Both Servers

### Terminal 1 - Backend:
```bash
cd backend
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:3000`

## 6. API Communication Flow

```
User Login (Frontend)
    ↓
POST /api/auth/login
    ↓
Backend validates credentials
    ↓
Backend returns JWT token
    ↓
Frontend stores token in localStorage
    ↓
Frontend includes token in Authorization header
    ↓
Protected endpoints verified
```

## 7. Authentication Headers

All protected API calls must include the JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE2OTAwMDAwMDAsImV4cCI6MTY5MDA4NjQwMH0.signature
```

## 8. Handling Token Expiration

When token expires (after 24 hours):

1. Backend returns 401 Unauthorized
2. Frontend catches error
3. User redirected to login page
4. User logs in again to get new token

```typescript
if (!response.ok && response.status === 401) {
  // Token expired or invalid
  logout()
  router.push('/')
}
```

## 9. Testing

Use these credentials to test:

**Register:**
- Name: Demo User
- Email: demo@acme.com
- Password: demo123

**Login:**
- Email: demo@acme.com
- Password: demo123

**Protected endpoint:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/auth/me
```

## 10. Troubleshooting

### CORS Error
- Backend CORS not configured for frontend origin
- Solution: Check `SecurityConfig.java` CORS configuration

### 401 Unauthorized
- Token missing or invalid
- Solution: Ensure token is stored and sent in Authorization header

### Connection refused
- Backend not running
- Solution: Start backend with `mvn spring-boot:run`

### Token not stored
- localStorage not working (might be in Incognito/Private mode)
- Solution: Use session storage or state management

## Next Steps

1. ✅ Create API client in frontend
2. ✅ Update Login page to use real API
3. ✅ Test register and login endpoints
4. ✅ Test protected endpoint (/api/auth/me)
5. ✅ Verify token is stored in localStorage
6. ✅ Verify CORS is working
7. Integrate more backend endpoints (Contracts, Dashboard, etc.)
8. Add error handling and loading states
9. Deploy to production

---

**Frontend-Backend Integration**: Complete ✅
