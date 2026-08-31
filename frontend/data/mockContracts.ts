export interface Contract {
  id: string
  vendor: string
  vendorLogo?: string
  subject: string
  contractType: string
  status: 'processed' | 'processing' | 'failed'
  risk: 'low' | 'medium' | 'high' | null
  received: string
  receivedDate: Date
  effectiveDate: string
  expiryDate: string
  paymentTerms: string
  renewal: string
  terminationNotice: string
  summary: string[]
  risks: RiskItem[]
}

export interface RiskItem {
  id: string
  description: string
  severity: 'low' | 'medium' | 'high'
  location: string
  recommendation: string
}

export const mockContracts: Contract[] = [
  {
    id: '1',
    vendor: 'Microsoft Corp.',
    vendorLogo: '🟦',
    subject: 'Enterprise Agreement Renewal',
    contractType: 'Enterprise Agreement',
    status: 'processed',
    risk: 'medium',
    received: 'Aug 26, 2026 10:30 AM',
    receivedDate: new Date('2026-08-26'),
    effectiveDate: '1 September 2026',
    expiryDate: '31 August 2027',
    paymentTerms: 'Net 30',
    renewal: 'Automatic',
    terminationNotice: '30 Days',
    summary: [
      '12-month enterprise agreement for Microsoft cloud services',
      'Auto-renewal clause detected',
      'Net 30 payment terms',
      'California governing law',
      'Medium legal risk due to auto-renewal without explicit notice',
    ],
    risks: [
      {
        id: 'risk-1',
        description: 'Auto-renewal clause without explicit notice',
        severity: 'high',
        location: 'Section 4.2',
        recommendation: 'Negotiate 90-day notice period or manual renewal requirement',
      },
      {
        id: 'risk-2',
        description: 'Unlimited liability for data breaches',
        severity: 'medium',
        location: 'Section 8.1',
        recommendation: 'Cap liability at 12 months of fees',
      },
      {
        id: 'risk-3',
        description: 'Price increase clause allows up to 10% annual increase',
        severity: 'medium',
        location: 'Section 5.3',
        recommendation: 'Negotiate price cap at 5% or implement best-price clause',
      },
    ],
  },
  {
    id: '2',
    vendor: 'Amazon Web Services',
    vendorLogo: '🟨',
    subject: 'AWS Service Agreement',
    contractType: 'Service Agreement',
    status: 'processing',
    risk: null,
    received: 'Aug 25, 2026 09:15 AM',
    receivedDate: new Date('2026-08-25'),
    effectiveDate: '1 September 2026',
    expiryDate: '31 August 2027',
    paymentTerms: 'Net 45',
    renewal: 'Manual',
    terminationNotice: '60 Days',
    summary: [
      '12-month AWS cloud infrastructure agreement',
      'Includes compute, storage, and database services',
      'On-demand pricing with volume discounts',
    ],
    risks: [],
  },
  {
    id: '3',
    vendor: 'Adobe Inc.',
    vendorLogo: '🔴',
    subject: 'Creative Cloud Agreement',
    contractType: 'Creative Cloud Agreement',
    status: 'processed',
    risk: 'low',
    received: 'Aug 24, 2026 04:45 PM',
    receivedDate: new Date('2026-08-24'),
    effectiveDate: '1 September 2026',
    expiryDate: '31 August 2027',
    paymentTerms: 'Net 30',
    renewal: 'Manual',
    terminationNotice: '30 Days',
    summary: [
      'Adobe Creative Cloud subscription for 50 seats',
      'Annual license with perpetual access',
      'Standard support included',
    ],
    risks: [],
  },
  {
    id: '4',
    vendor: 'Google LLC',
    vendorLogo: '🔵',
    subject: 'Google Workspace Agreement',
    contractType: 'Workspace Agreement',
    status: 'processed',
    risk: 'low',
    received: 'Aug 23, 2026 11:10 AM',
    receivedDate: new Date('2026-08-23'),
    effectiveDate: '1 September 2026',
    expiryDate: '31 August 2027',
    paymentTerms: 'Net 30',
    renewal: 'Automatic',
    terminationNotice: '30 Days',
    summary: [
      'Google Workspace Business Standard for 100 users',
      'Includes Gmail, Drive, Meet, and other applications',
      'Standard support with 24/7 availability',
    ],
    risks: [],
  },
  {
    id: '5',
    vendor: 'Dropbox Inc.',
    vendorLogo: '🔷',
    subject: 'Service Terms Agreement',
    contractType: 'Service Terms Agreement',
    status: 'processed',
    risk: 'medium',
    received: 'Aug 22, 2026 02:20 PM',
    receivedDate: new Date('2026-08-22'),
    effectiveDate: '1 September 2026',
    expiryDate: '31 August 2027',
    paymentTerms: 'Net 30',
    renewal: 'Automatic',
    terminationNotice: '30 Days',
    summary: [
      'Dropbox Business Standard for file storage and collaboration',
      'Unlimited storage and advanced admin controls',
      'Advanced support with dedicated account manager',
    ],
    risks: [
      {
        id: 'risk-4',
        description: 'Auto-renewal with 30-day notice',
        severity: 'low',
        location: 'Section 3.1',
        recommendation: 'Set calendar reminder 60 days before expiry',
      },
    ],
  },
]

export const getContractById = (id: string): Contract | undefined => {
  return mockContracts.find(contract => contract.id === id)
}

export const getRecentContracts = (limit: number = 5): Contract[] => {
  return mockContracts.slice(0, limit)
}
