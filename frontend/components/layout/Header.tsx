'use client'

import { useToast } from '@/lib/toast'
import { Mail, RotateCw } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { addToast } = useToast()
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
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, Sarah 👋
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Here's what's happening with your contracts today.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Gmail Status */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm text-gray-700">Gmail Connected</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <RotateCw
              className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
            />
            {isSyncing ? 'Syncing...' : 'Sync Inbox'}
          </button>

          {/* Profile Avatar */}
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            S
          </div>
        </div>
      </div>
    </header>
  )
}
