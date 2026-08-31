'use client'

import { useAuth } from '@/hooks/useAuth'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { notificationAPI } from '@/lib/api'

export function Header() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationAPI.getAll()
        if (res.data) {
          const unread = res.data.filter((n: any) => !n.isRead).length
          setUnreadCount(unread)
        }
      } catch (err) {
        // silent fallback
      }
    }

    fetchNotifications()
  }, [])

  return (
    <header
      className="px-8 py-4 z-10 shadow-sm border-b"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#DCE3DF', color: '#16231F' }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Welcome Title */}
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: '#173F32' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-xs font-medium mt-0.5" style={{ color: '#63736D' }}>
            Procurement Management Platform
          </p>
        </div>

        {/* Minimal Actions: Notifications & Simple Profile Entry Point */}
        <div className="flex items-center gap-3">
          {/* Notifications Icon */}
          <Link
            href="/notifications"
            className="p-2.5 rounded-xl transition-all relative border"
            style={{ backgroundColor: '#F7F7F2', borderColor: '#DCE3DF' }}
            title="Notifications"
          >
            <Bell className="w-4 h-4" style={{ color: '#173F32' }} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 text-white rounded-full text-[9px] font-bold flex items-center justify-center border"
                style={{ backgroundColor: '#173F32', borderColor: '#FFFFFF' }}
              >
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Simple Profile Entry Point Avatar */}
          <Link
            href="/settings"
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm text-white transition-transform hover:scale-105"
            style={{ backgroundColor: '#173F32' }}
            title="View Profile"
          >
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
              : 'U'}
          </Link>
        </div>
      </div>
    </header>
  )
}
