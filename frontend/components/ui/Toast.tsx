'use client'

import { useToast } from '@/lib/toast'
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50'
      case 'error':
        return 'bg-red-50'
      case 'warning':
        return 'bg-amber-50'
      case 'info':
      default:
        return 'bg-blue-50'
    }
  }

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-amber-800'
      case 'info':
      default:
        return 'text-blue-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${getBgColor(toast.type)} ${getTextColor(toast.type)} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-80 animate-in fade-in slide-in-from-right-4 duration-300`}
        >
          {getIcon(toast.type)}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
