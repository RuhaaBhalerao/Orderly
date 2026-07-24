'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Contract } from '@/types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { RiskBadge } from '@/components/shared/RiskBadge'
import { formatDate } from '@/lib/utils'

interface ContractTableProps {
  contracts: Contract[]
  showPagination?: boolean
}

export function ContractTable({
  contracts,
  showPagination = true,
}: ContractTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Received
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                AI Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Risk
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {contracts.map(contract => (
              <tr
                key={contract.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm">
                      {contract.vendorLogo}
                    </div>
                    <div className="font-medium text-gray-900">
                      {contract.vendor}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700">{contract.subject}</div>
                  <div className="text-xs text-gray-500">
                    {contract.contractType}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(contract.receivedDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={contract.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RiskBadge risk={contract.risk} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {contract.status !== 'processing' ? (
                    <Link href={`/contracts/${contract.id}`}>
                      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium text-sm">
                        Review
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  ) : (
                    <button disabled className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-400 cursor-not-allowed font-medium text-sm">
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <div>Showing 5 of 24 contracts</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
