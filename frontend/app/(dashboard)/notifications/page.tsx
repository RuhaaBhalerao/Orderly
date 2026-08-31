'use client'

import { useEffect, useState } from 'react'
import { notificationAPI } from '@/lib/api'
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await notificationAPI.getAll()
      if (res.data) setNotifications(res.data)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      fetchNotifications()
    } catch (err) {
      console.error('Error marking read:', err)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-forest" />
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-700" />
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-rose-700" />
      default:
        return <Info className="w-5 h-5 text-forest-muted" />
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-4 border-b border-subtleBorder">
        <div>
          <h2 className="text-2xl font-black text-forest tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-forest-muted" />
            In-App Procurement Notifications
          </h2>
          <p className="text-xs text-mutedText mt-1">
            Real-time status updates on requests, approvals, purchase orders, and SLAs
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-canvas hover:bg-mint-light text-forest text-xs font-bold rounded-xl border border-subtleBorder transition-all"
          >
            <CheckCheck className="w-4 h-4 text-forest" />
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-mutedText text-xs font-semibold">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-subtleBorder rounded-2xl p-12 text-center text-mutedText text-xs font-medium shadow-subtle">
          No notifications found.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                n.isRead
                  ? 'bg-canvas border-subtleBorder opacity-80'
                  : 'bg-white border-subtleBorder shadow-subtle hover:shadow-card'
              }`}
            >
              <div className="mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-forest">{n.title}</h4>
                  <span className="text-[10px] text-mutedText font-medium">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-bodyText font-medium">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
