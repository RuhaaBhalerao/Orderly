'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Contracts', href: '/contracts', icon: FileText },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleLogout = () => {
    router.push('/')
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-64 bg-sidebar text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-hover">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white">Procure AI</div>
            <div className="text-xs text-gray-400">Contract Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  active
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-sidebar-hover'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-sidebar-hover space-y-4">
        <div className="px-4 py-2">
          <div className="font-medium text-white">Sarah Johnson</div>
          <div className="text-xs text-gray-400">Procurement Manager</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-sidebar-hover rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
