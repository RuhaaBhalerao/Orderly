'use client'

import { KPICard } from '@/components/dashboard/KPICard'
import { ContractTable } from '@/components/contracts/ContractTable'
import { mockKPIs } from '@/data/mockKPIs'
import { mockContracts } from '@/data/mockContracts'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const recentContracts = mockContracts.slice(0, 5)

  return (
    <div className="p-8 space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockKPIs.map((kpi, index) => (
          <KPICard
            key={index}
            label={kpi.label}
            value={kpi.value}
            subtitle={kpi.subtitle}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* Recent Contracts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Contracts
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Latest contracts imported and processed
            </p>
          </div>
          <Link href="/contracts">
            <button className="flex items-center gap-2 text-primary hover:text-primary-dark font-semibold text-sm transition-colors">
              View all contracts
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        <ContractTable contracts={recentContracts} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Processing Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Processing Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processed</span>
              <span className="font-bold text-emerald-600">19</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processing</span>
              <span className="font-bold text-blue-600">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Failed</span>
              <span className="font-bold text-red-600">2</span>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Risk Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Risk</span>
              <span className="font-bold text-emerald-600">14</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium Risk</span>
              <span className="font-bold text-amber-600">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High Risk</span>
              <span className="font-bold text-red-600">2</span>
            </div>
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Upcoming Renewals
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Within 7 days</span>
              <span className="font-bold text-red-600">1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Within 30 days</span>
              <span className="font-bold text-amber-600">6</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Within 90 days</span>
              <span className="font-bold text-blue-600">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
