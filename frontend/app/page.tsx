'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('Password@123')
  }

  return (
    <div className="min-h-screen bg-canvas bg-organic-pattern text-bodyText flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-card border border-subtleBorder p-8 sm:p-10 space-y-6">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-subtle p-0.5 border border-sage/40 bg-white flex items-center justify-center">
              <img src="/orderly-icon.png" alt="Orderly Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-forest tracking-tight">Orderly</h1>
              <p className="text-xs text-mutedText font-medium mt-1">
                Orderly Procurement & Supplier Management Platform
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full px-4 py-3 bg-canvas border border-subtleBorder rounded-xl text-bodyText placeholder-mutedText/60 focus:outline-none focus:ring-2 focus:ring-forest text-sm font-medium transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-canvas border border-subtleBorder rounded-xl text-bodyText placeholder-mutedText/60 focus:outline-none focus:ring-2 focus:ring-forest text-sm font-medium transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-forest hover:bg-forest-light text-white font-bold py-3.5 rounded-xl shadow-subtle transition-all duration-200 disabled:opacity-50 text-sm flex items-center justify-center gap-2 group"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4 text-mint transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* Quick Role Fill Shortcuts for Demo */}
          <div className="pt-6 border-t border-subtleBorder space-y-3">
            <div className="text-[11px] font-bold text-mutedText uppercase tracking-wider text-center">
              Quick Demo Fill Credentials
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('rahul@example.com')}
                className="p-2.5 bg-mint-light hover:bg-mint border border-sage/60 rounded-xl transition-all text-left group"
              >
                <span className="font-bold text-forest block truncate group-hover:underline">Requester</span>
                <span className="text-[10px] text-mutedText font-mono block">EMP001</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('priya@example.com')}
                className="p-2.5 bg-mint-light hover:bg-mint border border-sage/60 rounded-xl transition-all text-left group"
              >
                <span className="font-bold text-forest block truncate group-hover:underline">Manager</span>
                <span className="text-[10px] text-mutedText font-mono block">EMP004</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('sneha@example.com')}
                className="p-2.5 bg-mint-light hover:bg-mint border border-sage/60 rounded-xl transition-all text-left group"
              >
                <span className="font-bold text-forest block truncate group-hover:underline">Officer</span>
                <span className="text-[10px] text-mutedText font-mono block">EMP006</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-mutedText pt-2">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-forest hover:text-forest-light font-bold underline underline-offset-2">
              Register with Employee ID
            </a>
          </div>
        </div>

        <div className="text-center text-xs text-mutedText font-medium">
          Orderly Procurement System • Verified & Enterprise Secured
        </div>
      </div>
    </div>
  )
}
