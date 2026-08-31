'use client'

import { useEffect, useState } from 'react'
import { purchaseRequestAPI } from '@/lib/api'
import { CheckSquare, CheckCircle, XCircle, User, Calendar } from 'lucide-react'

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [commentMap, setCommentMap] = useState<{ [key: string]: string }>({})
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchApprovals = async () => {
    setLoading(true)
    try {
      const res = await purchaseRequestAPI.getAll()
      if (res.data) {
        // Filter requests pending manager approval
        const pending = res.data.filter((r: any) => r.status === 'PENDING')
        setRequests(pending)
      }
    } catch (err) {
      console.error('Error fetching approvals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovals()
  }, [])

  const handleApprove = async (id: string) => {
    setActionId(id)
    try {
      const comment = commentMap[id] || 'Approved by Manager.'
      await purchaseRequestAPI.approve(id, comment)
      fetchApprovals()
    } catch (err) {
      console.error('Approve failed:', err)
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionId(id)
    try {
      const comment = commentMap[id] || 'Rejected by Manager.'
      await purchaseRequestAPI.reject(id, comment)
      fetchApprovals()
    } catch (err) {
      console.error('Reject failed:', err)
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-subtleBorder">
        <h2 className="text-2xl font-black text-forest tracking-tight flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-forest-muted" />
          Pending Department Approvals
        </h2>
        <p className="text-xs text-mutedText mt-1">
          Review purchase requests requiring manager sign-off before proceeding to procurement
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-mutedText text-xs font-semibold">Loading pending approvals...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-subtleBorder rounded-2xl p-12 text-center text-mutedText text-xs font-medium shadow-subtle">
          No pending approvals for your department. All requests have been reviewed!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((pr) => (
            <div
              key={pr.id}
              className="bg-white border border-subtleBorder rounded-2xl p-6 shadow-subtle space-y-4 hover:shadow-card transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-subtleBorder">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-forest">{pr.requestNumber}</span>
                    <span className="px-2.5 py-0.5 bg-mint text-forest border border-sage/60 rounded-full text-[10px] font-bold uppercase">
                      {pr.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-bodyText">{pr.title}</h3>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-lg font-black text-forest">
                    ₹{pr.estimatedBudget?.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-mutedText font-medium">Estimated Budget</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-canvas p-4 rounded-xl border border-subtleBorder">
                <div className="space-y-0.5">
                  <span className="text-mutedText font-bold uppercase text-[10px] block">Requested By</span>
                  <span className="font-semibold text-bodyText flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-forest-muted" />
                    {pr.requester?.name || 'Employee'} ({pr.requester?.department || 'Dept'})
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-mutedText font-bold uppercase text-[10px] block">Required Date</span>
                  <span className="font-semibold text-bodyText flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-forest-muted" />
                    {new Date(pr.requiredByDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-mutedText font-bold uppercase text-[10px] block">Priority Level</span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      pr.priority === 'URGENT'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-mint text-forest border border-sage/60'
                    }`}
                  >
                    {pr.priority}
                  </span>
                </div>
              </div>

              {pr.description && (
                <p className="text-xs text-mutedText italic bg-white p-3 rounded-xl border border-subtleBorder">
                  &quot;{pr.description}&quot;
                </p>
              )}

              {/* Action Form */}
              <div className="pt-3 border-t border-subtleBorder flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Add approval / rejection comments..."
                  value={commentMap[pr.id] || ''}
                  onChange={(e) => setCommentMap({ ...commentMap, [pr.id]: e.target.value })}
                  className="flex-1 px-4 py-2 bg-canvas border border-subtleBorder rounded-xl text-xs text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                />

                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => handleReject(pr.id)}
                    disabled={actionId === pr.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>

                  <button
                    onClick={() => handleApprove(pr.id)}
                    disabled={actionId === pr.id}
                    className="flex items-center gap-1.5 px-5 py-2 bg-forest hover:bg-forest-light text-white text-xs font-bold rounded-xl shadow-subtle transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 text-mint" /> Approve Request
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
