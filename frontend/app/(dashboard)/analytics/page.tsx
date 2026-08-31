'use client'

import { useEffect, useState } from 'react'
import { analyticsAPI } from '@/lib/api'
import {
  BarChart3,
  PieChart,
  Users,
  Award,
} from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await analyticsAPI.getMetrics()
        if (res.data) setData(res.data)
      } catch (err) {
        console.error('Error fetching analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-mutedText text-xs font-semibold">Loading procurement analytics...</div>
  }

  const overview = data?.overview || {}
  const spendByCategory = data?.spendByCategory || []
  const spendBySupplier = data?.spendBySupplier || []
  const supplierPerformance = data?.supplierPerformance || []

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-subtleBorder">
        <h2 className="text-2xl font-black text-forest tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-forest-muted" />
          Procurement Analytics & Financial Reporting
        </h2>
        <p className="text-xs text-mutedText mt-1">
          Aggregated spending, supplier performance distributions, and approval rate metrics
        </p>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-subtleBorder rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all">
          <span className="text-[10px] font-bold text-mutedText uppercase tracking-wider">Total Spending</span>
          <div className="text-2xl font-black text-forest mt-2">
            ₹{(overview.totalSpending || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-mutedText font-medium mt-1 block">Across confirmed POs</span>
        </div>

        <div className="bg-white border border-subtleBorder rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all">
          <span className="text-[10px] font-bold text-mutedText uppercase tracking-wider">Approval Rate</span>
          <div className="text-2xl font-black text-forest mt-2">{overview.approvalRate || 0}%</div>
          <span className="text-[11px] text-mutedText font-medium mt-1 block">Approved vs Total Requests</span>
        </div>

        <div className="bg-white border border-subtleBorder rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all">
          <span className="text-[10px] font-bold text-mutedText uppercase tracking-wider">PO Completion</span>
          <div className="text-2xl font-black text-forest mt-2">{overview.poCompletionRate || 0}%</div>
          <span className="text-[11px] text-mutedText font-medium mt-1 block">Delivered Orders Ratio</span>
        </div>

        <div className="bg-white border border-subtleBorder rounded-2xl p-5 shadow-subtle hover:shadow-card transition-all">
          <span className="text-[10px] font-bold text-mutedText uppercase tracking-wider">Total Requests</span>
          <div className="text-2xl font-black text-bodyText mt-2">{overview.totalRequests || 0}</div>
          <span className="text-[11px] text-mutedText font-medium mt-1 block">
            {overview.approvedRequests || 0} Approved • {overview.rejectedRequests || 0} Rejected
          </span>
        </div>
      </div>

      {/* Spend Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spend by Category */}
        <div className="bg-white border border-subtleBorder rounded-2xl p-6 shadow-subtle space-y-4">
          <h3 className="text-base font-bold text-forest flex items-center gap-2 border-b border-subtleBorder pb-3">
            <PieChart className="w-4 h-4 text-forest-muted" />
            Spending by Category
          </h3>

          <div className="space-y-4 pt-1">
            {spendByCategory.length === 0 ? (
              <p className="text-xs text-mutedText text-center py-6">No spend data available.</p>
            ) : (
              spendByCategory.map((c: any) => {
                const percent = Math.round((c.amount / (overview.totalSpending || 1)) * 100)
                return (
                  <div key={c.category} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-bodyText">{c.category}</span>
                      <span className="text-forest font-black">₹{c.amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-canvas rounded-full h-2.5 overflow-hidden border border-subtleBorder">
                      <div
                        className="bg-forest h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(10, percent))}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Spend by Supplier */}
        <div className="bg-white border border-subtleBorder rounded-2xl p-6 shadow-subtle space-y-4">
          <h3 className="text-base font-bold text-forest flex items-center gap-2 border-b border-subtleBorder pb-3">
            <Users className="w-4 h-4 text-forest-muted" />
            Top Supplier Allocation
          </h3>

          <div className="space-y-3 pt-1">
            {spendBySupplier.length === 0 ? (
              <p className="text-xs text-mutedText text-center py-6">No supplier allocation data available.</p>
            ) : (
              spendBySupplier.map((s: any) => (
                <div
                  key={s.supplier}
                  className="flex items-center justify-between p-3.5 bg-canvas rounded-xl border border-subtleBorder text-xs"
                >
                  <span className="font-bold text-bodyText">{s.supplier}</span>
                  <span className="font-black text-forest">
                    ₹{s.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Supplier Performance Table */}
      <div className="bg-white border border-subtleBorder rounded-2xl p-6 shadow-subtle space-y-4">
        <h3 className="text-base font-bold text-forest flex items-center gap-2 border-b border-subtleBorder pb-3">
          <Award className="w-4 h-4 text-amber-600" />
          Supplier Rating & Delivery Performance Rankings
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-bodyText">
            <thead className="bg-mint-light/60 uppercase font-bold text-mutedText text-[10px] tracking-wider border-b border-subtleBorder">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Supplier Name</th>
                <th className="px-4 py-3">Quality Rating</th>
                <th className="px-4 py-3">On-Time Delivery %</th>
                <th className="px-4 py-3 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtleBorder font-medium">
              {supplierPerformance.map((sp: any) => (
                <tr key={sp.name} className="hover:bg-mint-light/30 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-forest">{sp.name}</td>
                  <td className="px-4 py-3.5 font-bold text-amber-700">{sp.rating} / 5.0</td>
                  <td className="px-4 py-3.5 font-bold text-forest">{sp.deliveryPerformance}%</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 bg-mint text-forest border border-sage/80 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      High Performer
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
