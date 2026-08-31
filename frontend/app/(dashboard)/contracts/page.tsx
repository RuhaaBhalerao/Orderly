'use client'

import { useEffect, useState } from 'react'
import { contractAPI, supplierAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Calendar,
  DollarSign,
  Building,
  X,
} from 'lucide-react'

export default function ContractsPage() {
  const { user } = useAuth()
  const [contracts, setContracts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Upload Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [contractName, setContractName] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [contractValue, setContractValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const fetchContracts = async () => {
    setLoading(true)
    try {
      const res = await contractAPI.getAll()
      if (res.data) setContracts(res.data)

      const suppRes = await supplierAPI.getAll()
      if (suppRes.data) setSuppliers(suppRes.data)
    } catch (err) {
      console.error('Error loading contracts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  const handleUploadContract = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError('')

    if (!contractName || !contractValue || !startDate || !expiryDate) {
      setUploadError('Please complete all required fields.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('contractName', contractName)
      if (supplierId) formData.append('supplierId', supplierId)
      formData.append('contractValue', contractValue)
      formData.append('startDate', startDate)
      formData.append('expiryDate', expiryDate)
      if (notes) formData.append('notes', notes)
      if (file) formData.append('file', file)

      const res = await contractAPI.create(formData)
      if (res.error) {
        setUploadError(res.error)
      } else {
        setIsModalOpen(false)
        setContractName('')
        setContractValue('')
        setStartDate('')
        setExpiryDate('')
        setNotes('')
        setFile(null)
        fetchContracts()
      }
    } catch (err) {
      setUploadError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteContract = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) return
    try {
      await contractAPI.delete(id)
      fetchContracts()
    } catch (err) {
      console.error('Error deleting contract:', err)
    }
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-subtleBorder">
        <div>
          <h2 className="text-2xl font-black text-forest tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-forest-muted" />
            Contract & SLA Management
          </h2>
          <p className="text-xs text-mutedText mt-1">
            Upload PDF contracts, track expiration dates, and associate contracts with suppliers
          </p>
        </div>

        {(user?.role === 'PROCUREMENT_OFFICER' || user?.role === 'ADMIN') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-light text-white text-xs font-bold rounded-xl shadow-subtle transition-all duration-200"
          >
            <Plus className="w-4 h-4 text-mint" />
            Upload Contract PDF
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-mutedText text-xs font-semibold">Loading contracts...</div>
      ) : contracts.length === 0 ? (
        <div className="bg-white border border-subtleBorder rounded-2xl p-12 text-center text-mutedText text-xs font-medium shadow-subtle">
          No contracts recorded yet. Upload a contract PDF to track expiration alerts.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-subtleBorder rounded-2xl p-6 shadow-subtle hover:shadow-card transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-subtleBorder pb-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-forest line-clamp-1">{c.contractName}</h3>
                    <div className="text-xs text-mutedText flex items-center gap-1.5 font-medium">
                      <Building className="w-3.5 h-3.5 text-forest-muted" />
                      Supplier: <strong className="text-bodyText">{c.supplier?.name || 'Unassigned'}</strong>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.status === 'EXPIRING_SOON'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                        : c.status === 'EXPIRED'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-mint text-forest border border-sage/80'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-bodyText pt-1 font-medium">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-forest" />
                    Value: <strong className="text-forest">₹{c.contractValue?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex items-center gap-1 text-mutedText">
                    <Calendar className="w-3.5 h-3.5 text-forest-muted" />
                    Expiry: {new Date(c.expiryDate).toLocaleDateString()}
                  </div>
                </div>

                {c.notes && <p className="text-xs text-mutedText italic line-clamp-2 bg-canvas p-2.5 rounded-xl border border-subtleBorder">&quot;{c.notes}&quot;</p>}
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-subtleBorder flex items-center justify-between">
                {c.fileUrl ? (
                  <a
                    href={`${API_BASE}${c.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-mint-light hover:bg-mint text-forest text-xs font-bold rounded-xl border border-sage/60 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-forest" /> View / Download PDF
                  </a>
                ) : (
                  <span className="text-[11px] text-mutedText italic">No PDF file attached</span>
                )}

                {(user?.role === 'PROCUREMENT_OFFICER' || user?.role === 'ADMIN') && (
                  <button
                    onClick={() => handleDeleteContract(c.id)}
                    className="p-2 text-mutedText hover:text-rose-800 rounded-xl hover:bg-rose-50 transition-colors"
                    title="Delete Contract"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Contract Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-forest/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-subtleBorder rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-floating space-y-4">
            <div className="flex items-center justify-between border-b border-subtleBorder pb-3">
              <h3 className="text-lg font-bold text-forest">Upload Contract PDF</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-mutedText hover:text-forest">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadContract} className="space-y-4 text-xs">
              <div>
                <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Contract Title *</label>
                <input
                  type="text"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="Master Hardware Supply SLA"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Contract Value (₹) *</label>
                  <input
                    type="number"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    placeholder="1180000"
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Expiry Date *</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Contract PDF File</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-mutedText file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-forest file:text-white hover:file:bg-forest-light cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Notes & Scope</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Master SLA terms, renewal reminders..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
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
                  disabled={uploading}
                  className="px-5 py-2.5 bg-forest hover:bg-forest-light text-white font-bold rounded-xl shadow-subtle disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Contract PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
