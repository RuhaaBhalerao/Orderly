'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Building, Calendar, DollarSign } from 'lucide-react'
import { contractAPI } from '@/lib/api'
import Link from 'next/link'

export default function ContractDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string

  const [contract, setContract] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContract() {
      setLoading(true)
      try {
        const res = await contractAPI.getById(contractId)
        if (res.data) setContract(res.data)
      } catch (err) {
        console.error('Error fetching contract:', err)
      } finally {
        setLoading(false)
      }
    }

    if (contractId) fetchContract()
  }, [contractId])

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'

  if (loading) {
    return <div className="text-center py-12 text-mutedText text-xs font-semibold">Loading contract details...</div>
  }

  if (!contract) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-lg font-bold text-forest">Contract Not Found</h3>
        <Link href="/contracts" className="text-forest hover:text-forest-light font-bold text-xs underline">
          Return to Contracts List
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-mutedText hover:text-forest font-bold text-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-forest" /> Back to Contracts
      </button>

      <div className="bg-white border border-subtleBorder rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-start justify-between border-b border-subtleBorder pb-4">
          <div>
            <h1 className="text-2xl font-black text-forest">{contract.contractName}</h1>
            <div className="text-xs text-mutedText flex items-center gap-2 mt-1 font-medium">
              <Building className="w-3.5 h-3.5 text-forest-muted" />
              Supplier: <strong className="text-bodyText">{contract.supplier?.name || 'Unassigned'}</strong>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              contract.status === 'EXPIRING_SOON'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : contract.status === 'EXPIRED'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-mint text-forest border border-sage/80'
            }`}
          >
            {contract.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-canvas rounded-2xl border border-subtleBorder space-y-1">
            <span className="text-mutedText block flex items-center gap-1 font-bold text-[10px] uppercase">
              <DollarSign className="w-3.5 h-3.5 text-forest" /> Contract Value
            </span>
            <span className="font-black text-forest text-lg">
              ₹{contract.contractValue?.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-4 bg-canvas rounded-2xl border border-subtleBorder space-y-1">
            <span className="text-mutedText block flex items-center gap-1 font-bold text-[10px] uppercase">
              <Calendar className="w-3.5 h-3.5 text-forest-muted" /> Expiry Date
            </span>
            <span className="font-black text-bodyText text-lg">
              {new Date(contract.expiryDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {contract.notes && (
          <div className="p-4 bg-canvas rounded-2xl border border-subtleBorder space-y-1 text-xs">
            <span className="text-mutedText font-bold uppercase text-[10px] block">Notes & Scope:</span>
            <p className="text-bodyText font-medium">{contract.notes}</p>
          </div>
        )}

        {contract.fileUrl && (
          <div className="pt-2">
            <a
              href={`${API_BASE}${contract.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-forest hover:bg-forest-light text-white font-bold text-xs rounded-xl shadow-subtle transition-all"
            >
              <Download className="w-4 h-4 text-mint" /> Download Original PDF
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
