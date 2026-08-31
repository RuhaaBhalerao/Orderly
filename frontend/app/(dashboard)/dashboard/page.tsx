'use client'

import { useEffect, useState } from 'react'
import { dashboardAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import {
  DollarSign,
  FileCheck,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  ShoppingBag,
  ArrowUpRight,
  Plus,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await dashboardAPI.getMetrics()
        if (res.error) {
          setError(res.error)
        } else {
          setData(res.data)
        }
      } catch (err) {
        setError('Failed to load dashboard metrics')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 rounded-xl w-1/4" style={{ backgroundColor: '#BFD8CC' }}></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border" style={{ borderColor: '#DCE3DF' }}></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl font-semibold text-xs border" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}>
        {error}
      </div>
    )
  }

  const kpis = data?.kpis || {}
  const recentRequests = data?.recentRequests || []
  const expiringContracts = data?.expiringContractsList || []
  const recentPOs = data?.recentPOs || []

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div
        className="p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden"
        style={{ backgroundColor: '#173F32', color: '#FFFFFF' }}
      >
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#245646', color: '#DCEDE5', border: '1px solid rgba(191, 216, 204, 0.3)' }}>
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: '#DCEDE5' }}></span>
            Procurement Operations Active
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Procurement Control Center
          </h2>
          <p className="text-xs font-medium max-w-xl" style={{ color: '#BFD8CC' }}>
            Real-time requisition tracking, vendor SLA compliance, and automated supplier scoring matrix for <strong className="text-white">{user?.department || 'Enterprise'}</strong> department.
          </p>
        </div>

        {user?.role === 'REQUESTER' && (
          <Link
            href="/requests"
            className="z-10 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: '#DCEDE5', color: '#173F32' }}
          >
            <Plus className="w-4 h-4" style={{ color: '#173F32' }} />
            New Purchase Request
          </Link>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Spend */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm border border-l-4 transition-all hover:shadow-md"
          style={{ borderColor: '#DCE3DF', borderLeftColor: '#173F32' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#63736D' }}>
              Total Spend
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#DCEDE5', color: '#173F32' }}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black mt-3" style={{ color: '#173F32' }}>
            ₹{(kpis.totalProcurementSpend || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] mt-1 flex items-center gap-1 font-semibold" style={{ color: '#527968' }}>
            <TrendingUp className="w-3.5 h-3.5 text-forest" /> Confirmed Purchase Orders
          </p>
        </div>

        {/* Pending Requests */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm border border-l-4 transition-all hover:shadow-md"
          style={{ borderColor: '#DCE3DF', borderLeftColor: '#D97706' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#63736D' }}>
              Pending Requests
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black mt-3" style={{ color: '#173F32' }}>
            {kpis.pendingRequests || 0}
          </div>
          <p className="text-[11px] mt-1 font-medium" style={{ color: '#63736D' }}>Awaiting Manager Review</p>
        </div>

        {/* Approved Requests */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm border border-l-4 transition-all hover:shadow-md"
          style={{ borderColor: '#DCE3DF', borderLeftColor: '#173F32' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#63736D' }}>
              Approved Requests
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#DCEDE5', color: '#173F32' }}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black mt-3" style={{ color: '#173F32' }}>
            {kpis.approvedRequests || 0}
          </div>
          <p className="text-[11px] mt-1 font-semibold" style={{ color: '#527968' }}>Ready for Procurement</p>
        </div>

        {/* Open POs */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm border border-l-4 transition-all hover:shadow-md"
          style={{ borderColor: '#DCE3DF', borderLeftColor: '#245646' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#63736D' }}>
              Open POs
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EDF5F1', color: '#173F32' }}>
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black mt-3" style={{ color: '#173F32' }}>
            {kpis.openPurchaseOrders || 0}
          </div>
          <p className="text-[11px] mt-1 font-medium" style={{ color: '#63736D' }}>Active delivery pipelines</p>
        </div>

        {/* Active Suppliers */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm border border-l-4 transition-all hover:shadow-md"
          style={{ borderColor: '#DCE3DF', borderLeftColor: '#173F32' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#63736D' }}>
              Active Suppliers
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#DCEDE5', color: '#173F32' }}>
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black mt-3" style={{ color: '#173F32' }}>
            {kpis.activeSuppliers || 0}
          </div>
          <p className="text-[11px] mt-1 font-semibold" style={{ color: '#527968' }}>Verified Vendor Network</p>
        </div>

        {/* Active Contracts */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm border border-l-4 transition-all hover:shadow-md"
          style={{ borderColor: '#DCE3DF', borderLeftColor: '#173F32' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#63736D' }}>
              Active Contracts
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#DCEDE5', color: '#173F32' }}>
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black mt-3" style={{ color: '#173F32' }}>
            {kpis.activeContracts || 0}
          </div>
          <p className="text-[11px] mt-1 font-medium" style={{ color: '#63736D' }}>Active SLAs & Agreements</p>
        </div>

        {/* Contracts Expiring Soon */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm border border-l-4 transition-all hover:shadow-md"
          style={{ borderColor: '#DCE3DF', borderLeftColor: '#DC2626' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#63736D' }}>
              Expiring Soon
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black mt-3" style={{ color: '#DC2626' }}>
            {kpis.contractsExpiringSoon || 0}
          </div>
          <p className="text-[11px] mt-1 font-medium" style={{ color: '#63736D' }}>Expiring within 30 days</p>
        </div>

        {/* Pending Approvals (for Managers) */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm border border-l-4 transition-all hover:shadow-md"
          style={{ borderColor: '#DCE3DF', borderLeftColor: '#D97706' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#63736D' }}>
              Dept Approvals
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black mt-3" style={{ color: '#173F32' }}>
            {kpis.pendingApprovals || 0}
          </div>
          <p className="text-[11px] mt-1 font-medium" style={{ color: '#63736D' }}>Awaiting Manager Action</p>
        </div>
      </div>

      {/* Main Grid: Recent Purchase Requests & Contract Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Purchase Requests Table Container */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border space-y-4" style={{ borderColor: '#DCE3DF' }}>
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#DCE3DF' }}>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: '#173F32' }}>
              <FileCheck className="w-4 h-4" style={{ color: '#527968' }} />
              Recent Purchase Requests
            </h3>
            <Link
              href="/requests"
              className="text-xs flex items-center gap-1 font-bold transition-colors"
              style={{ color: '#173F32' }}
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" style={{ color: '#16231F' }}>
              <thead className="uppercase font-bold text-[10px] tracking-wider border-b" style={{ backgroundColor: '#EDF5F1', color: '#63736D', borderColor: '#DCE3DF' }}>
                <tr>
                  <th className="px-3.5 py-3 rounded-l-xl">Req #</th>
                  <th className="px-3.5 py-3">Title</th>
                  <th className="px-3.5 py-3">Budget</th>
                  <th className="px-3.5 py-3">Priority</th>
                  <th className="px-3.5 py-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium" style={{ borderColor: '#DCE3DF' }}>
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center" style={{ color: '#63736D' }}>
                      No purchase requests found.
                    </td>
                  </tr>
                ) : (
                  recentRequests.map((pr: any) => (
                    <tr key={pr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3.5 py-3.5 font-mono font-bold" style={{ color: '#173F32' }}>
                        {pr.requestNumber}
                      </td>
                      <td className="px-3.5 py-3.5 font-semibold text-bodyText truncate max-w-[200px]">
                        {pr.title}
                      </td>
                      <td className="px-3.5 py-3.5 font-black" style={{ color: '#173F32' }}>
                        ₹{pr.estimatedBudget?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3.5 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            pr.priority === 'URGENT'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : pr.priority === 'HIGH'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-canvas text-mutedText border border-subtleBorder'
                          }`}
                        >
                          {pr.priority}
                        </span>
                      </td>
                      <td className="px-3.5 py-3.5">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={
                            pr.status === 'PENDING'
                              ? { backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }
                              : pr.status === 'MANAGER_APPROVED' || pr.status === 'DELIVERED'
                              ? { backgroundColor: '#DCEDE5', color: '#173F32', border: '1px solid #BFD8CC' }
                              : { backgroundColor: '#EDF5F1', color: '#173F32', border: '1px solid #BFD8CC' }
                          }
                        >
                          {pr.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contract Expiry Alerts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4" style={{ borderColor: '#DCE3DF' }}>
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#DCE3DF' }}>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: '#DC2626' }}>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Contract Alerts
            </h3>
            <Link
              href="/contracts"
              className="text-xs flex items-center gap-1 font-bold transition-colors text-rose-700"
            >
              View Contracts <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {expiringContracts.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: '#63736D' }}>
                No contract alerts at this time.
              </p>
            ) : (
              expiringContracts.map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl space-y-2 text-xs border"
                  style={{ backgroundColor: '#F7F7F2', borderColor: '#DCE3DF' }}
                >
                  <div className="flex items-center justify-between font-bold" style={{ color: '#173F32' }}>
                    <span className="truncate">{c.contractName}</span>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: '#FECACA' }}>
                      Expiring Soon
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium" style={{ color: '#63736D' }}>
                    <span>Supplier: {c.supplier?.name || 'Unassigned'}</span>
                    <span className="font-bold" style={{ color: '#173F32' }}>₹{c.contractValue?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[10px]" style={{ color: '#63736D' }}>
                    Expiry Date: {new Date(c.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Purchase Orders Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4" style={{ borderColor: '#DCE3DF' }}>
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#DCE3DF' }}>
          <h3 className="text-base font-bold flex items-center gap-2" style={{ color: '#173F32' }}>
            <ShoppingBag className="w-4 h-4" style={{ color: '#527968' }} />
            Active Purchase Orders
          </h3>
          <Link
            href="/purchase-orders"
            className="text-xs flex items-center gap-1 font-bold transition-colors"
            style={{ color: '#173F32' }}
          >
            Track All Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentPOs.length === 0 ? (
            <p className="text-xs col-span-3 text-center py-8" style={{ color: '#63736D' }}>
              No active purchase orders found.
            </p>
          ) : (
            recentPOs.map((po: any) => (
              <div
                key={po.id}
                className="p-4 rounded-xl space-y-2 text-xs border"
                style={{ backgroundColor: '#F7F7F2', borderColor: '#DCE3DF' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold" style={{ color: '#173F32' }}>{po.poNumber}</span>
                  <span
                    className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border"
                    style={{ backgroundColor: '#DCEDE5', color: '#173F32', borderColor: '#BFD8CC' }}
                  >
                    {po.status}
                  </span>
                </div>
                <div className="font-semibold" style={{ color: '#16231F' }}>Supplier: {po.supplier?.name}</div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t" style={{ borderColor: '#DCE3DF', color: '#63736D' }}>
                  <span className="font-bold" style={{ color: '#173F32' }}>₹{po.totalAmount?.toLocaleString('en-IN')}</span>
                  <span>Est Delivery: {new Date(po.expectedDeliveryDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
