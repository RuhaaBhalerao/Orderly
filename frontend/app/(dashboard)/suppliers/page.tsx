'use client'

import { useEffect, useState } from 'react'
import { supplierAPI } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import {
  Users,
  Plus,
  Search,
  Star,
  Building,
  Phone,
  Mail,
  MapPin,
  X,
  GitCompare,
} from 'lucide-react'
import Link from 'next/link'

export default function SuppliersPage() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [category, setCategory] = useState('IT Hardware')
  const [rating, setRating] = useState(4.5)
  const [deliveryPerformance, setDeliveryPerformance] = useState(92)
  const [paymentTerms] = useState('Net 30')
  const [notes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const res = await supplierAPI.getAll()
      if (res.data) setSuppliers(res.data)
    } catch (err) {
      console.error('Error fetching suppliers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !contactPerson || !email || !phone) {
      setError('Please complete all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const res = await supplierAPI.create({
        name,
        contactPerson,
        email,
        phone,
        address,
        category,
        rating: Number(rating),
        deliveryPerformance: Number(deliveryPerformance),
        paymentTerms,
        notes,
      })

      if (res.error) {
        setError(res.error)
      } else {
        setIsModalOpen(false)
        setName('')
        setContactPerson('')
        setEmail('')
        setPhone('')
        setAddress('')
        fetchSuppliers()
      }
    } catch (err) {
      setError('Failed to register supplier')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || s.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-subtleBorder">
        <div>
          <h2 className="text-2xl font-black text-forest tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-forest-muted" />
            Supplier Directory & Performance Network
          </h2>
          <p className="text-xs text-mutedText mt-1">
            Manage vendor profiles, track SLA delivery ratings, and run weighted supplier comparisons
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(user?.role === 'PROCUREMENT_OFFICER' || user?.role === 'ADMIN') && (
            <>
              <Link
                href="/suppliers/compare"
                className="flex items-center gap-2 px-4 py-2.5 bg-mint-light hover:bg-mint text-forest border border-sage/60 text-xs font-bold rounded-xl transition-all"
              >
                <GitCompare className="w-4 h-4 text-forest" />
                Run Weighted Matrix
              </Link>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-forest hover:bg-forest-light text-white text-xs font-bold rounded-xl shadow-subtle transition-all duration-200"
              >
                <Plus className="w-4 h-4 text-mint" />
                Add New Supplier
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-subtleBorder shadow-subtle">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-mutedText absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search suppliers by name or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-canvas border border-subtleBorder rounded-xl text-xs text-bodyText placeholder-mutedText/60 focus:outline-none focus:ring-2 focus:ring-forest font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-mutedText font-bold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-canvas border border-subtleBorder rounded-xl text-xs text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
          >
            <option value="">All Categories</option>
            <option value="IT Hardware">IT Hardware</option>
            <option value="Office Equipment">Office Equipment</option>
            <option value="Software License">Software License</option>
            <option value="Logistics">Logistics</option>
          </select>
        </div>
      </div>

      {/* Supplier Grid */}
      {loading ? (
        <div className="text-center py-12 text-mutedText text-xs font-semibold">Loading supplier directory...</div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-white border border-subtleBorder rounded-2xl p-12 text-center text-mutedText text-xs font-medium shadow-subtle">
          No suppliers match your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-subtleBorder rounded-2xl p-6 shadow-subtle hover:shadow-card transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-forest">{s.name}</h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-mint-light text-forest border border-sage/50 text-[10px] font-bold rounded-full">
                      {s.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-amber-800 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {s.rating}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-mutedText pt-2 border-t border-subtleBorder">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-forest-muted" />
                    <span className="font-semibold text-bodyText">{s.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-forest-muted" />
                    <span>{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-forest-muted" />
                    <span>{s.phone}</span>
                  </div>
                  {s.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-forest-muted" />
                      <span className="truncate">{s.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="pt-3 border-t border-subtleBorder flex items-center justify-between text-xs">
                <span className="text-mutedText font-semibold">On-Time Delivery</span>
                <span className="font-bold text-forest bg-mint px-2.5 py-0.5 rounded-full border border-sage/80">
                  {s.deliveryPerformance}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-forest/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-subtleBorder rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-floating space-y-4">
            <div className="flex items-center justify-between border-b border-subtleBorder pb-3">
              <h3 className="text-lg font-bold text-forest">Add New Supplier</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-mutedText hover:text-forest">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
              <div>
                <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Supplier Company Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Hardware Technologies"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Contact Person *</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Vikram Malhotra"
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                    required
                  />
                </div>

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
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@apex.com"
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Phone Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 45, Tech Park, Bengaluru"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">Quality Rating (1 to 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                  />
                </div>

                <div>
                  <label className="block text-mutedText font-bold mb-1 uppercase tracking-wider text-[11px]">On-Time Delivery %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={deliveryPerformance}
                    onChange={(e) => setDeliveryPerformance(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-subtleBorder rounded-xl text-bodyText focus:outline-none focus:ring-2 focus:ring-forest font-medium"
                  />
                </div>
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
                  {submitting ? 'Adding Supplier...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
