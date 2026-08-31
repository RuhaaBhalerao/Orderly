'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ShieldCheck, UserCheck, Briefcase } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, register } = useAuth()
  const [name, setName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'REQUESTER' | 'MANAGER' | 'PROCUREMENT_OFFICER'>('REQUESTER')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const validateForm = (): boolean => {
    setError('')

    if (!name.trim()) {
      setError('Full Name is required')
      return false
    }

    if (!employeeId.trim()) {
      setError('Employee ID is required (e.g., EMP001)')
      return false
    }

    if (!email.trim()) {
      setError('Email address is required')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Valid email address is required')
      return false
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await register(name, employeeId.trim().toUpperCase(), email, password, role)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      setSuccess('Account created successfully! Redirecting to procurement workspace...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1200)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas bg-organic-pattern text-bodyText flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="bg-white rounded-3xl shadow-card border border-subtleBorder p-8 sm:p-10 space-y-6">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-subtle p-0.5 border border-sage/40 bg-white flex items-center justify-center">
              <img src="/orderly-icon.png" alt="Orderly Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-forest tracking-tight">Orderly Registry</h1>
              <p className="text-xs text-mutedText font-medium mt-1">
                Employee Verification & Role Registration
              </p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-mint text-forest border border-sage/80 px-4 py-3 rounded-xl text-xs font-bold">
                {success}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText placeholder-mutedText/60 focus:outline-none focus:ring-2 focus:ring-forest text-sm font-medium transition-all"
                required
              />
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText mb-1.5">
                Assigned Employee ID *
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP001"
                className="w-full px-4 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText placeholder-mutedText/60 focus:outline-none focus:ring-2 focus:ring-forest text-sm font-mono transition-all"
                required
              />
              <p className="text-[11px] text-mutedText mt-1">
                Must match assigned registry ID (e.g., EMP001 to EMP010)
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText mb-1.5">
                Work Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full px-4 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText placeholder-mutedText/60 focus:outline-none focus:ring-2 focus:ring-forest text-sm font-medium transition-all"
                required
              />
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mutedText mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest text-sm transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mutedText mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest text-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText mb-2">
                Select Your Assigned Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('REQUESTER')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    role === 'REQUESTER'
                      ? 'bg-mint-light border-forest text-forest font-bold shadow-sm'
                      : 'bg-canvas border-subtleBorder text-mutedText hover:border-sage'
                  }`}
                >
                  <UserCheck className="w-5 h-5 mb-1 text-forest" />
                  <span className="text-xs font-bold block">Requester</span>
                  <span className="text-[10px] text-mutedText block">Create PRs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('MANAGER')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    role === 'MANAGER'
                      ? 'bg-mint-light border-forest text-forest font-bold shadow-sm'
                      : 'bg-canvas border-subtleBorder text-mutedText hover:border-sage'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 mb-1 text-forest" />
                  <span className="text-xs font-bold block">Manager</span>
                  <span className="text-[10px] text-mutedText block">Approve PRs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('PROCUREMENT_OFFICER')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    role === 'PROCUREMENT_OFFICER'
                      ? 'bg-mint-light border-forest text-forest font-bold shadow-sm'
                      : 'bg-canvas border-subtleBorder text-mutedText hover:border-sage'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mb-1 text-forest" />
                  <span className="text-xs font-bold block">Procurement</span>
                  <span className="text-[10px] text-mutedText block">Manage POs</span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-forest hover:bg-forest-light text-white font-bold py-3.5 rounded-xl shadow-subtle transition-all duration-200 disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Verifying Registry...' : 'Register Workspace Account'}
            </button>
          </form>

          <div className="pt-4 border-t border-subtleBorder text-center text-xs text-mutedText">
            Already registered?{' '}
            <a href="/" className="text-forest hover:text-forest-light font-bold underline underline-offset-2">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
