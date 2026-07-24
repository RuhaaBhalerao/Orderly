'use client'

import { ContractTable } from '@/components/contracts/ContractTable'
import { mockContracts } from '@/data/mockContracts'
import { useState } from 'react'
import { Search, Filter } from 'lucide-react'

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [riskFilter, setRiskFilter] = useState<string | null>(null)

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch =
      searchTerm === '' ||
      contract.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.subject.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === null || contract.status === statusFilter

    const matchesRisk =
      riskFilter === null ||
      (riskFilter === 'null' && contract.risk === null) ||
      contract.risk === riskFilter

    return matchesSearch && matchesStatus && matchesRisk
  })

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
        <p className="text-gray-600 mt-1">
          Manage and review all imported contracts
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vendor or contract name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
          </div>

          <button
            onClick={() => setStatusFilter(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>

          {['processed', 'processing', 'failed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}

          <div className="flex items-center gap-2 ml-6">
            <span className="text-sm font-medium text-gray-700">Risk:</span>
          </div>

          <button
            onClick={() => setRiskFilter(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              riskFilter === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>

          {['low', 'medium', 'high', 'null'].map(risk => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                riskFilter === risk
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {risk === 'null' ? 'Unassessed' : risk}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-bold">{filteredContracts.length}</span> of{' '}
          <span className="font-bold">{mockContracts.length}</span> contracts
        </div>

        {filteredContracts.length > 0 ? (
          <ContractTable contracts={filteredContracts} showPagination={false} />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 font-medium">No contracts found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
