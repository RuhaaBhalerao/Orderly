'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  FileCheck,
  CheckSquare,
  Users,
  GitCompare,
  ShoppingBag,
  FileText,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const role = user?.role || 'REQUESTER'

  let navItems: { name: string; href: string; icon: any }[] = []

  if (role === 'REQUESTER') {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'My Requests', href: '/requests', icon: FileCheck },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Profile', href: '/settings', icon: Settings },
    ]
  } else if (role === 'MANAGER') {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Requests', href: '/requests', icon: FileCheck },
      { name: 'Approvals', href: '/approvals', icon: CheckSquare },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Profile', href: '/settings', icon: Settings },
    ]
  } else if (role === 'PROCUREMENT_OFFICER') {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Purchase Requests', href: '/requests', icon: FileCheck },
      { name: 'Suppliers', href: '/suppliers', icon: Users },
      { name: 'Compare Suppliers', href: '/suppliers/compare', icon: GitCompare },
      { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingBag },
      { name: 'Contracts', href: '/contracts', icon: FileText },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Profile', href: '/settings', icon: Settings },
    ]
  } else {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Requests', href: '/requests', icon: FileCheck },
      { name: 'Approvals', href: '/approvals', icon: CheckSquare },
      { name: 'Suppliers', href: '/suppliers', icon: Users },
      { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingBag },
      { name: 'Contracts', href: '/contracts', icon: FileText },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Audit Logs', href: '/audit-logs', icon: ShieldAlert },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Profile', href: '/settings', icon: Settings },
    ]
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      className="w-64 flex flex-col min-h-screen border-r shadow-2xl z-20"
      style={{ backgroundColor: '#173F32', borderColor: '#245646', color: '#FFFFFF' }}
    >
      {/* Brand Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'rgba(191, 216, 204, 0.2)' }}>
        <Link href="/dashboard" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md transition-transform group-hover:scale-105 bg-white p-0.5 border border-sage/40 flex items-center justify-center flex-shrink-0">
            <img src="/orderly-icon.png" alt="Orderly Logo" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-lg">Orderly</div>
            <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#BFD8CC' }}>
              Procurement
            </div>
          </div>
        </Link>
      </div>

      {/* Clean Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#BFD8CC' }}>
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <div
                className="flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 font-semibold text-sm cursor-pointer"
                style={
                  active
                    ? {
                        backgroundColor: '#245646',
                        color: '#FFFFFF',
                        border: '1px solid rgba(191, 216, 204, 0.3)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }
                    : {
                        color: '#BFD8CC',
                        backgroundColor: 'transparent',
                      }
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: active ? '#DCEDE5' : '#BFD8CC' }}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {active && <ChevronRight className="w-4 h-4" style={{ color: '#DCEDE5' }} />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Minimal Footer Sign Out */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(191, 216, 204, 0.2)', backgroundColor: '#0F2C23' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl transition-colors font-semibold text-xs cursor-pointer hover:bg-rose-500/20 hover:text-white"
          style={{ color: '#BFD8CC' }}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Workspace</span>
        </button>
      </div>
    </aside>
  )
}
