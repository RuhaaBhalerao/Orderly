'use client'

import { useAuth } from '@/hooks/useAuth'
import { User, Building2, BadgeCheck, Mail, Shield, Hash } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl space-y-6">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-subtleBorder">
        <h2 className="text-2xl font-black text-forest tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-forest-muted" />
          User Profile & Employee Details
        </h2>
        <p className="text-xs text-mutedText mt-1">
          Personal identity details, assigned organizational department, employee ID, and system access role
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-subtleBorder rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
        {/* User Hero Row */}
        <div className="flex items-center gap-5 pb-6 border-b border-subtleBorder">
          <div className="w-16 h-16 bg-forest text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-subtle flex-shrink-0">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
              : 'U'}
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-forest">{user?.name || 'Orderly User'}</h3>
            <p className="text-xs text-mutedText font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-forest-muted" />
              {user?.email}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-3 py-0.5 bg-mint-light text-forest border border-sage/60 text-[11px] font-mono font-bold rounded-full">
                ID: {user?.employeeId || 'N/A'}
              </span>
              <span className="px-3 py-0.5 bg-mint text-forest border border-sage/80 text-[11px] font-bold rounded-full uppercase tracking-wider">
                {user?.role || 'REQUESTER'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Profile Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-canvas rounded-2xl border border-subtleBorder space-y-1">
            <span className="text-mutedText block flex items-center gap-1.5 font-bold uppercase text-[10px]">
              <Hash className="w-3.5 h-3.5 text-forest-muted" />
              Employee Registry ID
            </span>
            <span className="font-mono font-bold text-forest text-base">{user?.employeeId || 'N/A'}</span>
          </div>

          <div className="p-4 bg-canvas rounded-2xl border border-subtleBorder space-y-1">
            <span className="text-mutedText block flex items-center gap-1.5 font-bold uppercase text-[10px]">
              <Building2 className="w-3.5 h-3.5 text-forest-muted" />
              Department Assignment
            </span>
            <span className="font-bold text-forest text-base">{user?.department || 'Unassigned'}</span>
          </div>

          <div className="p-4 bg-canvas rounded-2xl border border-subtleBorder space-y-1">
            <span className="text-mutedText block flex items-center gap-1.5 font-bold uppercase text-[10px]">
              <Shield className="w-3.5 h-3.5 text-forest-muted" />
              System Authorization Role
            </span>
            <span className="font-bold text-forest text-base">{user?.role || 'REQUESTER'}</span>
          </div>

          <div className="p-4 bg-canvas rounded-2xl border border-subtleBorder space-y-1">
            <span className="text-mutedText block flex items-center gap-1.5 font-bold uppercase text-[10px]">
              <BadgeCheck className="w-3.5 h-3.5 text-forest" />
              Employee Registry Status
            </span>
            <span className="font-bold text-forest text-base">Verified & Active</span>
          </div>
        </div>

        {/* Security Assurance Banner */}
        <div className="p-4 bg-mint-light border border-sage/60 rounded-2xl text-xs text-forest space-y-1">
          <strong className="font-bold block">Employee Verification Security:</strong>
          <p className="text-forest-muted">
            Your profile details and permissions ({user?.role}) are strictly authenticated against the enterprise Employee Registry database.
          </p>
        </div>
      </div>
    </div>
  )
}
