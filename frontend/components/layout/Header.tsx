'use client'

import { useToast } from '@/lib/toast'
import { useAuth } from '@/hooks/useAuth'
import { Mail, RotateCw, Bell } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { addToast } = useToast()
  const { user } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      addToast('Successfully synced 3 contracts', 'success')
    } catch (error) {
      addToast('Failed to sync contracts', 'error')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-6">
      <div className="flex items-center justify-between">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-base text-gray-600 mt-2">
            Here&apos;s what&apos;s happening with your procurement workflow today.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>

          {/* Gmail Status */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-subtle rounded-lg border border-gray-200">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-700">Gmail Connected</span>
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
          >
            <RotateCw
              className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
            />
            {isSyncing ? 'Syncing...' : 'Sync Inbox'}
          </button>

          {/* Profile Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold shadow-md text-xs">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
              : 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
