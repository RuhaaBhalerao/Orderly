'use client'

import { useEffect, useState } from 'react'
import { auditLogAPI } from '@/lib/api'
import { ShieldAlert } from 'lucide-react'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await auditLogAPI.getAll()
        if (res.data) setLogs(res.data)
      } catch (err) {
        console.error('Error loading audit logs:', err)
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [])

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-subtleBorder">
        <h2 className="text-2xl font-black text-forest tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-forest-muted" />
          System Audit Trail & Compliance Logs
        </h2>
        <p className="text-xs text-mutedText mt-1">
          Immutable audit record of all user activities, approvals, supplier selections, and PO creation
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-mutedText text-xs font-semibold">Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-subtleBorder rounded-2xl p-12 text-center text-mutedText text-xs font-medium shadow-subtle">
          No audit log entries recorded yet.
        </div>
      ) : (
        <div className="bg-white border border-subtleBorder rounded-2xl overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-bodyText">
              <thead className="bg-mint-light/60 uppercase font-bold text-mutedText text-[10px] tracking-wider border-b border-subtleBorder">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3 rounded-r-xl">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtleBorder font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-mint-light/30 transition-colors">
                    <td className="px-4 py-3 text-mutedText whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-sans font-bold text-forest">
                      {log.user ? `${log.user.name} (${log.user.role})` : 'System'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 bg-mint text-forest border border-sage/80 font-bold rounded-full uppercase tracking-wider text-[9px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-bodyText font-medium">{log.entityType}</td>
                    <td className="px-4 py-3 text-mutedText max-w-xs truncate">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
