'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Home,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Contracts', href: '/contracts', icon: FileText },
    { name: 'AI Assistant', href: '/chat', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center shadow-md">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Procure AI</div>
            <div className="text-xs text-gray-500">Contract Intelligence</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium',
                  active
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="px-4 py-3 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-900 text-sm">{user?.name || 'User'}</div>
          <div className="text-xs text-gray-500 mt-0.5">{user?.email || 'No email'}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
