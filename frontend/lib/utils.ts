import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getRiskColor(risk: string | null): string {
  switch (risk) {
    case 'low':
      return 'text-emerald-600'
    case 'medium':
      return 'text-amber-600'
    case 'high':
      return 'text-red-600'
    default:
      return 'text-gray-400'
  }
}

export function getRiskBgColor(risk: string | null): string {
  switch (risk) {
    case 'low':
      return 'bg-emerald-50'
    case 'medium':
      return 'bg-amber-50'
    case 'high':
      return 'bg-red-50'
    default:
      return 'bg-gray-50'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'processed':
      return 'text-emerald-600'
    case 'processing':
      return 'text-blue-600'
    case 'failed':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'processed':
      return 'bg-emerald-50'
    case 'processing':
      return 'bg-blue-50'
    case 'failed':
      return 'bg-red-50'
    default:
      return 'bg-gray-50'
  }
}

export function transformApiContractToFrontend(apiContract: any): any {
  if (!apiContract) return null;

  const vendorName = apiContract.aiVendor || apiContract.vendor || 'Unknown Vendor';
  const rawRisk = (apiContract.aiRiskLevel || apiContract.riskLevel || 'medium').toLowerCase();
  const risk = ['low', 'medium', 'high'].includes(rawRisk) ? rawRisk : 'medium';

  const status =
    apiContract.analysisStatus === 'PENDING'
      ? 'processing'
      : apiContract.analysisStatus === 'FAILED'
      ? 'failed'
      : 'processed';

  const summary = apiContract.aiSummary
    ? [apiContract.aiSummary]
    : apiContract.summary
    ? [apiContract.summary]
    : ['Contract imported and extracted.'];

  let risks: any[] = [];
  if (Array.isArray(apiContract.aiRisks)) {
    risks = apiContract.aiRisks.map((r: any, idx: number) => ({
      id: `risk-${idx}`,
      description: r.title || r.description || 'Risk factor identified',
      severity: (r.severity || 'medium').toLowerCase(),
      location: 'Contract Terms',
      recommendation: r.description || 'Review clause before signing.',
    }));
  }

  const effectiveDateStr = apiContract.aiEffectiveDate
    ? new Date(apiContract.aiEffectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : apiContract.effectiveDate
    ? new Date(apiContract.effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  const expiryDateStr = apiContract.aiExpiryDate
    ? new Date(apiContract.aiExpiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : apiContract.expiryDate
    ? new Date(apiContract.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  return {
    id: apiContract.id,
    vendor: vendorName,
    vendorLogo: vendorName.charAt(0).toUpperCase(),
    subject: apiContract.title || apiContract.fileName || 'Supplier Contract',
    contractType: apiContract.aiContractType || apiContract.contractType || 'Agreement',
    status,
    risk,
    received: formatDate(apiContract.createdAt || new Date()),
    receivedDate: new Date(apiContract.createdAt || new Date()),
    effectiveDate: effectiveDateStr,
    expiryDate: expiryDateStr,
    paymentTerms: (apiContract.aiKeyTerms || []).find((t: string) => t.toLowerCase().includes('payment') || t.toLowerCase().includes('net')) || 'Net 30',
    renewal: (apiContract.aiKeyTerms || []).find((t: string) => t.toLowerCase().includes('renew') || t.toLowerCase().includes('annual')) || 'Standard Renewal',
    terminationNotice: (apiContract.aiKeyTerms || []).find((t: string) => t.toLowerCase().includes('notice') || t.toLowerCase().includes('terminat')) || '30 days notice',
    summary,
    risks,
    pdfPath: apiContract.pdfPath,
    extractedText: apiContract.extractedText,
  };
}

