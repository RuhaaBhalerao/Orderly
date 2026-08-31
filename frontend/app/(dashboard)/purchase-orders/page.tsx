'use client'

import { useEffect, useState } from 'react'
import { purchaseOrderAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Building,
  Calendar,
  ArrowRight,
} from 'lucide-react'

const PO_STATUS_STEPS = ['DRAFT', 'ISSUED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'DELIVERED']

export default function PurchaseOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await purchaseOrderAPI.getAll()
      if (res.data) setOrders(res.data)
    } catch (err) {
      console.error('Error fetching purchase orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleAdvanceStatus = async (poId: string, currentStatus: string) => {
    const currentIndex = PO_STATUS_STEPS.indexOf(currentStatus)
    if (currentIndex < 0 || currentIndex >= PO_STATUS_STEPS.length - 1) return

    const nextStatus = PO_STATUS_STEPS[currentIndex + 1]
    setUpdatingId(poId)

    try {
      const res = await purchaseOrderAPI.updateStatus(poId, nextStatus)
      if (!res.error) {
        fetchOrders()
      }
    } catch (err) {
      console.error('Error updating PO status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-subtleBorder">
        <h2 className="text-2xl font-black text-forest tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-forest-muted" />
          Purchase Orders & Delivery Tracking
        </h2>
        <p className="text-xs text-mutedText mt-1">
          Track purchase order issuance, vendor acknowledgement, and step-by-step delivery lifecycle
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-mutedText text-xs font-semibold">Loading purchase orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-subtleBorder rounded-2xl p-12 text-center text-mutedText text-xs font-medium shadow-subtle">
          No purchase orders issued yet. Select a supplier for an approved purchase request to issue a PO.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((po) => {
            const currentStepIdx = PO_STATUS_STEPS.indexOf(po.status)

            return (
              <div
                key={po.id}
                className="bg-white border border-subtleBorder rounded-2xl p-6 sm:p-8 shadow-subtle space-y-6 hover:shadow-card transition-all"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-subtleBorder pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-black text-forest">{po.poNumber}</span>
                      <span className="text-xs text-mutedText font-medium">
                        Request: <strong className="text-bodyText">{po.purchaseRequest?.requestNumber}</strong>
                      </span>
                    </div>
                    <div className="text-sm font-bold text-bodyText flex items-center gap-2">
                      <Building className="w-4 h-4 text-forest-muted" />
                      Supplier: <span className="text-forest">{po.supplier?.name}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <div className="text-xl font-black text-forest">
                      ₹{po.totalAmount?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-mutedText flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-forest-muted" />
                      Expected Delivery: {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Delivery Progress Stepper */}
                <div className="space-y-3 bg-canvas p-5 rounded-2xl border border-subtleBorder">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-mutedText">
                    Delivery Lifecycle Stepper
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {PO_STATUS_STEPS.map((stepName, idx) => {
                      const isDone = idx <= currentStepIdx
                      const isCurrent = idx === currentStepIdx

                      return (
                        <div key={stepName} className="flex flex-col items-center text-center space-y-1.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-forest text-white shadow-subtle border-2 border-mint ring-2 ring-forest/20 animate-pulse'
                                : isDone
                                ? 'bg-mint text-forest border border-sage/80'
                                : 'bg-white text-mutedText border border-subtleBorder'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isCurrent
                                ? 'text-forest'
                                : isDone
                                ? 'text-forest-muted'
                                : 'text-mutedText'
                            }`}
                          >
                            {stepName}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Line Items & Advance Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-mutedText font-bold uppercase text-[10px] block">Order Line Items:</span>
                    <ul className="list-disc list-inside text-bodyText font-medium space-y-0.5">
                      {po.items?.map((item: any) => (
                        <li key={item.id}>
                          {item.description} (Qty: {item.quantity} × ₹{item.unitPrice?.toLocaleString('en-IN')})
                        </li>
                      ))}
                    </ul>
                  </div>

                  {(user?.role === 'PROCUREMENT_OFFICER' || user?.role === 'ADMIN') &&
                    currentStepIdx < PO_STATUS_STEPS.length - 1 && (
                      <button
                        onClick={() => handleAdvanceStatus(po.id, po.status)}
                        disabled={updatingId === po.id}
                        className="flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-light text-white font-bold rounded-xl shadow-subtle transition-all disabled:opacity-50"
                      >
                        <Truck className="w-4 h-4 text-mint" />
                        {updatingId === po.id
                          ? 'Updating Pipeline...'
                          : `Advance to ${PO_STATUS_STEPS[currentStepIdx + 1]}`}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
