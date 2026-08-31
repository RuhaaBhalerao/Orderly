'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { purchaseRequestAPI, purchaseOrderAPI } from '@/lib/api'
import {
  GitCompare,
  CheckCircle2,
  Award,
  X,
} from 'lucide-react'

export default function SupplierComparisonPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestId = searchParams.get('requestId')

  const [approvedRequests, setApprovedRequests] = useState<any[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState<string>(requestId || '')
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selecting, setSelecting] = useState<string | null>(null)

  // PO Generation Modal
  const [isPOModalOpen, setIsPOModalOpen] = useState(false)
  const [selectedSupplierForPO, setSelectedSupplierForPO] = useState<any>(null)
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [shippingInfo, setShippingInfo] = useState('')
  const [issuingPO, setIssuingPO] = useState(false)
  const [poError, setPoError] = useState('')

  useEffect(() => {
    async function loadApprovedRequests() {
      try {
        const res = await purchaseRequestAPI.getAll()
        if (res.data) {
          const approved = res.data.filter(
            (r: any) => r.status === 'MANAGER_APPROVED' || r.status === 'PROCUREMENT'
          )
          setApprovedRequests(approved)
          if (!selectedRequestId && approved.length > 0) {
            setSelectedRequestId(approved[0].id)
          }
        }
      } catch (err) {
        console.error('Error fetching approved requests:', err)
      }
    }

    loadApprovedRequests()
  }, [selectedRequestId])

  useEffect(() => {
    if (!selectedRequestId) return

    async function runComparison() {
      setLoading(true)
      try {
        const res = await purchaseRequestAPI.compareSuppliers(selectedRequestId)
        if (res.data) setComparisonData(res.data)
      } catch (err) {
        console.error('Error running comparison:', err)
      } finally {
        setLoading(false)
      }
    }

    runComparison()
  }, [selectedRequestId])

  const handleSelectSupplier = async (supplier: any) => {
    setSelecting(supplier.supplierId)
    try {
      await purchaseRequestAPI.selectSupplier(
        selectedRequestId,
        supplier.supplierId,
        'Selected via weighted supplier score matrix.'
      )
      setSelectedSupplierForPO(supplier)
      setIsPOModalOpen(true)
    } catch (err) {
      console.error('Error selecting supplier:', err)
    } finally {
      setSelecting(null)
    }
  }

  const handleIssuePO = async (e: React.FormEvent) => {
    e.preventDefault()
    setPoError('')

    if (!expectedDeliveryDate) {
      setPoError('Expected delivery date is required.')
      return
    }

    setIssuingPO(true)
    try {
      const pr = comparisonData?.purchaseRequest
      const res = await purchaseOrderAPI.create({
        purchaseRequestId: selectedRequestId,
        supplierId: selectedSupplierForPO.supplierId,
        expectedDeliveryDate,
        paymentTerms,
        shippingInformation: shippingInfo,
        items: [
          {
            description: pr?.title || 'Purchase Request Item',
            quantity: pr?.quantity || 1,
            unitPrice: selectedSupplierForPO.unitPrice,
          },
        ],
      })

      if (res.error) {
        setPoError(res.error)
      } else {
        setIsPOModalOpen(false)
        router.push('/purchase-orders')
      }
    } catch (err) {
      setPoError('Failed to issue purchase order')
    } finally {
      setIssuingPO(false)
    }
  }

  const currentPR = comparisonData?.purchaseRequest

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-subtleBorder">
        <div>
          <h2 className="text-2xl font-black text-forest tracking-tight flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-forest-muted" />
            Supplier Comparison Matrix
          </h2>
          <p className="text-xs text-mutedText mt-1">
            Weighted Scoring Formula: Price (40%) + Delivery (25%) + Rating (20%) + Performance (15%)
          </p>
        </div>

        {/* Request Selector */}
        {approvedRequests.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-mutedText">Select Request:</span>
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              className="px-3.5 py-2 bg-white border border-subtleBorder rounded-xl text-xs font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest shadow-subtle"
            >
              {approvedRequests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.requestNumber} - {r.title} (₹{r.estimatedBudget?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-mutedText text-xs font-semibold">
          Calculating weighted supplier comparison matrix...
        </div>
      ) : !comparisonData ? (
        <div className="bg-white border border-subtleBorder rounded-2xl p-12 text-center text-mutedText text-xs font-medium shadow-subtle">
          No approved purchase requests available for comparison.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Target PR Summary Banner */}
          <div className="bg-white border border-subtleBorder rounded-2xl p-6 shadow-subtle space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-subtleBorder pb-3">
              <div>
                <span className="font-mono text-sm font-black text-forest">{currentPR?.requestNumber}</span>
                <h3 className="text-lg font-bold text-bodyText mt-0.5">{currentPR?.title}</h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-mutedText font-medium block">Approved Budget</span>
                <span className="text-xl font-black text-forest">
                  ₹{currentPR?.estimatedBudget?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
              <div>
                <span className="text-mutedText text-[10px] uppercase font-bold block">Category</span>
                <span className="font-semibold text-bodyText">{currentPR?.category}</span>
              </div>
              <div>
                <span className="text-mutedText text-[10px] uppercase font-bold block">Quantity</span>
                <span className="font-semibold text-bodyText">{currentPR?.quantity} Units</span>
              </div>
              <div>
                <span className="text-mutedText text-[10px] uppercase font-bold block">Priority</span>
                <span className="font-semibold text-bodyText">{currentPR?.priority}</span>
              </div>
              <div>
                <span className="text-mutedText text-[10px] uppercase font-bold block">Required By</span>
                <span className="font-semibold text-bodyText">
                  {new Date(currentPR?.requiredByDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Recommendation Summary */}
            <div className="p-4 bg-mint-light border border-sage/60 rounded-xl text-xs text-forest flex items-start gap-3">
              <Award className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">System Recommendation:</strong>
                <p className="mt-0.5 text-forest-muted">{comparisonData.recommendationSummary}</p>
              </div>
            </div>
          </div>

          {/* Supplier Comparison Cards Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonData.suppliers?.map((supp: any) => {
              const isTop = supp.supplierId === comparisonData.recommendedSupplierId

              return (
                <div
                  key={supp.supplierId}
                  className={`bg-white rounded-2xl p-6 shadow-subtle space-y-4 border transition-all flex flex-col justify-between ${
                    isTop ? 'border-forest ring-2 ring-forest/20 shadow-card' : 'border-subtleBorder'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-subtleBorder pb-3">
                      <div>
                        {isTop && (
                          <span className="inline-block px-2.5 py-0.5 bg-mint text-forest border border-sage/80 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
                            #1 Recommended
                          </span>
                        )}
                        <h4 className="text-base font-bold text-forest">{supp.supplierName}</h4>
                        <span className="text-xs text-mutedText font-medium">Contact: {supp.contactPerson}</span>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-forest">{supp.scoreBreakdown.overallScore}</div>
                        <span className="text-[9px] uppercase font-bold text-mutedText">Overall Score</span>
                      </div>
                    </div>

                    {/* Pricing & Delivery Breakdown */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-canvas rounded-xl border border-subtleBorder">
                        <span className="text-[10px] uppercase font-bold text-mutedText block">Unit Price</span>
                        <span className="font-extrabold text-forest text-sm">
                          ₹{supp.unitPrice?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="p-3 bg-canvas rounded-xl border border-subtleBorder">
                        <span className="text-[10px] uppercase font-bold text-mutedText block">Est. Delivery</span>
                        <span className="font-extrabold text-bodyText text-sm">{supp.deliveryDays} Days</span>
                      </div>
                    </div>

                    {/* Detailed Weighted Scores */}
                    <div className="space-y-2 pt-2 text-xs">
                      <div className="flex justify-between items-center text-mutedText">
                        <span>Price Score (40%)</span>
                        <span className="font-bold text-forest">{supp.scoreBreakdown.priceScore}/100</span>
                      </div>
                      <div className="flex justify-between items-center text-mutedText">
                        <span>Delivery Speed (25%)</span>
                        <span className="font-bold text-forest">{supp.scoreBreakdown.deliveryScore}/100</span>
                      </div>
                      <div className="flex justify-between items-center text-mutedText">
                        <span>Quality Rating (20%)</span>
                        <span className="font-bold text-forest">{supp.scoreBreakdown.ratingScore}/100</span>
                      </div>
                      <div className="flex justify-between items-center text-mutedText">
                        <span>On-Time History (15%)</span>
                        <span className="font-bold text-forest">{supp.scoreBreakdown.performanceScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Select Action */}
                  <div className="pt-4 border-t border-subtleBorder">
                    <button
                      onClick={() => handleSelectSupplier(supp)}
                      disabled={selecting === supp.supplierId}
                      className={`w-full py-3 rounded-xl font-bold text-xs shadow-subtle transition-all flex items-center justify-center gap-2 ${
                        isTop
                          ? 'bg-forest hover:bg-forest-light text-white'
                          : 'bg-canvas hover:bg-mint-light text-forest border border-subtleBorder'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {selecting === supp.supplierId ? 'Selecting...' : `Select ${supp.supplierName} & Issue PO`}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* PO Generation Modal */}
      {isPOModalOpen && (
        <div className="fixed inset-0 bg-forest/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-subtleBorder rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-floating space-y-4">
            <div className="flex items-center justify-between border-b border-subtleBorder pb-3">
              <div>
                <h3 className="text-lg font-bold text-forest">Issue Purchase Order</h3>
                <p className="text-xs text-mutedText font-medium">
                  Confirm delivery timeline and issue formal PO to {selectedSupplierForPO?.supplierName}
                </p>
              </div>
              <button onClick={() => setIsPOModalOpen(false)} className="text-mutedText hover:text-forest">
                <X className="w-5 h-5" />
              </button>
            </div>

            {poError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">
                {poError}
              </div>
            )}

            <form onSubmit={handleIssuePO} className="space-y-4 text-xs">
              <div className="p-4 bg-mint-light border border-sage/60 rounded-xl space-y-1">
                <div className="flex justify-between text-forest font-bold">
                  <span>Selected Supplier:</span>
                  <span>{selectedSupplierForPO?.supplierName}</span>
                </div>
                <div className="flex justify-between text-mutedText">
                  <span>Unit Price:</span>
                  <span>₹{selectedSupplierForPO?.unitPrice?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-forest font-black pt-1 border-t border-sage/40">
                  <span>Total PO Value:</span>
                  <span>₹{(selectedSupplierForPO?.unitPrice * (currentPR?.quantity || 1)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Expected Delivery Date *</label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Net 30"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                />
              </div>

              <div>
                <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Shipping / Delivery Notes</label>
                <textarea
                  value={shippingInfo}
                  onChange={(e) => setShippingInfo(e.target.value)}
                  placeholder="e.g. Deliver to IT Hub Server Room 3"
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-subtleBorder">
                <button
                  type="button"
                  onClick={() => setIsPOModalOpen(false)}
                  className="px-4 py-2.5 bg-canvas hover:bg-mint-light text-mutedText font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuingPO}
                  className="px-5 py-2.5 bg-forest hover:bg-forest-light text-white font-bold rounded-xl shadow-subtle disabled:opacity-50"
                >
                  {issuingPO ? 'Issuing PO...' : 'Confirm & Issue Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
