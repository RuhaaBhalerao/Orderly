'use client'

import { useEffect, useState } from 'react'
import { Mail, MailCheck, AlertCircle, Loader2 } from 'lucide-react'
import { gmailAPI } from '@/lib/api'

interface GmailStatusData {
  connected: boolean
  gmailEmail?: string
  connectedAt?: string
  lastSyncAt?: string
  syncStatus?: string
}

export function GmailStatus() {
  const [status, setStatus] = useState<GmailStatusData>({ connected: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncLoading, setSyncLoading] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setLoading(true)
    setError('')
    const response = await gmailAPI.getStatus()

    if (response.error) {
      setError(response.error)
      setStatus({ connected: false })
    } else {
      setStatus(response.data)
    }
    setLoading(false)
  }

  const handleConnect = async () => {
    const response = await gmailAPI.getAuthUrl()

    if (response.error) {
      setError(response.error)
      return
    }

    if (response.data?.authUrl) {
      // Redirect to Google OAuth
      window.location.href = response.data.authUrl
    }
  }

  const handleSync = async () => {
    setSyncLoading(true)
    setError('')

    const response = await gmailAPI.syncInbox()

    if (response.error) {
      setError(response.error)
    } else {
      // Refresh status
      await fetchStatus()
    }

    setSyncLoading(false)
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Gmail account? You will need to reconnect to sync emails.')) {
      return
    }

    const response = await gmailAPI.disconnect()

    if (response.error) {
      setError(response.error)
    } else {
      setStatus({ connected: false })
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Gmail Integration</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {status.connected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>

        {status.connected && (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
            <MailCheck className="w-3 h-3" />
            Active
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Connected Details */}
      {status.connected && status.gmailEmail && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium text-gray-900">{status.gmailEmail}</span>
          </div>
          {status.lastSyncAt && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last sync</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(status.lastSyncAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {!status.connected ? (
          <button
            onClick={handleConnect}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors"
          >
            Connect Gmail
          </button>
        ) : (
          <>
            <button
              onClick={handleSync}
              disabled={syncLoading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 font-medium text-sm transition-colors"
            >
              {syncLoading ? 'Syncing...' : 'Sync Inbox'}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors"
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* Sync Status */}
      {status.syncStatus && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Sync status:{' '}
            <span className="font-semibold text-gray-900">
              {status.syncStatus === 'IDLE' && 'Ready'}
              {status.syncStatus === 'SYNCING' && 'In progress'}
              {status.syncStatus === 'ERROR' && 'Error'}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
