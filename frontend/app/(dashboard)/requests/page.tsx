'use client'

import { useEffect, useState } from 'react'
import { purchaseRequestAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  GitCompare,
  X,
} from 'lucide-react'
import Link from 'next/link'

export default function PurchaseRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Create PR Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('IT Hardware')
  const [quantity, setQuantity] = useState(1)
  const [estimatedBudget, setEstimatedBudget] = useState('')
  const [priority, setPriority] = useState<'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [requiredByDate, setRequiredByDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await purchaseRequestAPI.getAll()
      if (res.data) setRequests(res.data)
    } catch (err) {
      console.error('Error loading purchase requests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!title || !quantity || !estimatedBudget || !requiredByDate) {
      setFormError('Please complete all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const res = await purchaseRequestAPI.create({
        title,
        description,
        category,
        quantity: Number(quantity),
        estimatedBudget: Number(estimatedBudget),
        priority,
        requiredByDate,
      })

      if (res.error) {
        setFormError(res.error)
      } else {
        setIsModalOpen(false)
        setTitle('')
        setDescription('')
        setQuantity(1)
        setEstimatedBudget('')
        fetchRequests()
      }
    } catch (err) {
      setFormError('Failed to create purchase request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleManagerApprove = async (id: string) => {
    try {
      await purchaseRequestAPI.approve(id, 'Approved by Department Manager.')
      fetchRequests()
    } catch (err) {
      console.error('Approve failed:', err)
    }
  }

  const filteredRequests = requests.filter((pr) => {
    const matchesSearch =
      pr.requestNumber?.toLowerCase().includes(search.toLowerCase()) ||
      pr.title?.toLowerCase().includes(search.toLowerCase()) ||
      pr.category?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || pr.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-subtleBorder">
        <div>
          <h2 className="text-2xl font-black text-forest tracking-tight flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-forest-muted" />
            Purchase Requests
          </h2>
          <p className="text-xs text-mutedText mt-1">
            Create, track, and manage capital requisition requests and approvals
          </p>
        </div>

        {user?.role === 'REQUESTER' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-light text-white text-xs font-bold rounded-xl shadow-subtle transition-all duration-200"
          >
            <Plus className="w-4 h-4 text-mint" />
            Create Purchase Request
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-subtleBorder shadow-subtle">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-mutedText absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by request # or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-canvas border border-subtleBorder rounded-xl text-xs text-bodyText placeholder-mutedText/60 focus:outline-none focus:ring-2 focus:ring-forest font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-mutedText" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-canvas border border-subtleBorder rounded-xl text-xs text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="MANAGER_APPROVED">MANAGER_APPROVED</option>
            <option value="PROCUREMENT">PROCUREMENT</option>
            <option value="ORDERED">ORDERED</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>
        </div>
      </div>

      {/* Table Data Card */}
      {loading ? (
        <div className="text-center py-12 text-mutedText text-xs font-semibold">Loading purchase requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border border-subtleBorder rounded-2xl p-12 text-center text-mutedText text-xs font-medium shadow-subtle">
          No purchase requests match your current filters.
        </div>
      ) : (
        <div className="bg-white border border-subtleBorder rounded-2xl overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-bodyText">
              <thead className="bg-mint-light/60 uppercase font-bold text-mutedText text-[10px] tracking-wider border-b border-subtleBorder">
                <tr>
                  <th className="px-4 py-3.5">Request #</th>
                  <th className="px-4 py-3.5">Title & Description</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Budget</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Required Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtleBorder font-medium">
                {filteredRequests.map((pr) => (
                  <tr key={pr.id} className="hover:bg-mint-light/30 transition-colors">
                    <td className="px-4 py-4 font-mono font-bold text-forest whitespace-nowrap">
                      {pr.requestNumber}
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <div className="font-bold text-forest line-clamp-1">{pr.title}</div>
                      <div className="text-[11px] text-mutedText line-clamp-1 mt-0.5">{pr.description}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 bg-canvas border border-subtleBorder text-mutedText rounded-full text-[10px] font-bold">
                        {pr.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-forest whitespace-nowrap">
                      ₹{pr.estimatedBudget?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
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
                    <td className="px-4 py-4 text-mutedText whitespace-nowrap">
                      {new Date(pr.requiredByDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          pr.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : pr.status === 'MANAGER_APPROVED'
                            ? 'bg-mint text-forest border border-sage/80'
                            : pr.status === 'PROCUREMENT' || pr.status === 'ORDERED'
                            ? 'bg-mint-light text-forest border border-sage/50'
                            : 'bg-canvas text-mutedText border border-subtleBorder'
                        }`}
                      >
                        {pr.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {user?.role === 'MANAGER' && pr.status === 'PENDING' && (
                          <button
                            onClick={() => handleManagerApprove(pr.id)}
                            className="px-3 py-1 bg-mint text-forest hover:bg-sage border border-sage/80 rounded-lg text-xs font-bold transition-all"
                          >
                            Approve
                          </button>
                        )}

                        {(user?.role === 'PROCUREMENT_OFFICER' || user?.role === 'ADMIN') &&
                          pr.status === 'MANAGER_APPROVED' && (
                            <Link
                              href={`/suppliers/compare?requestId=${pr.id}`}
                              className="flex items-center gap-1 px-3 py-1 bg-forest hover:bg-forest-light text-white rounded-lg text-xs font-bold shadow-subtle transition-all"
                            >
                              <GitCompare className="w-3.5 h-3.5 text-mint" /> Compare Suppliers
                            </Link>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Purchase Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-forest/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-subtleBorder rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-floating space-y-4">
            <div className="flex items-center justify-between border-b border-subtleBorder pb-3">
              <h3 className="text-lg font-bold text-forest">New Purchase Request</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-mutedText hover:text-forest">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Request Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. High-Spec Development Laptops"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText placeholder-mutedText/60 focus:outline-none focus:ring-2 focus:ring-forest text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Description & Purpose</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why this purchase is needed for your team..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText placeholder-mutedText/60 focus:outline-none focus:ring-2 focus:ring-forest text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                  >
                    <option value="IT Hardware">IT Hardware</option>
                    <option value="Office Equipment">Office Equipment</option>
                    <option value="Software License">Software License</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Facilities">Facilities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Estimated Budget (₹) *</label>
                  <input
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    placeholder="250000"
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Priority *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                  >
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Required By Date *</label>
                <input
                  type="date"
                  value={requiredByDate}
                  onChange={(e) => setRequiredByDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-subtleBorder">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-canvas hover:bg-mint-light text-mutedText font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-forest hover:bg-forest-light text-white font-bold rounded-xl shadow-subtle disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
