export type ContractStatus = 'processed' | 'processing' | 'failed'
export type RiskLevel = 'low' | 'medium' | 'high' | null
export type MessageType = 'user' | 'ai'

export interface Contract {
  id: string
  vendor: string
  vendorLogo?: string
  subject: string
  contractType: string
  status: ContractStatus
  risk: RiskLevel
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

export interface ChatMessage {
  id: string
  type: MessageType
  content: string
  timestamp: Date
}

export interface User {
  id: string
  name: string
  email: string
  title: string
  company: string
  avatar: string
  gmailConnected: boolean
  gmailEmail?: string
  lastSync?: string
}

export interface KPI {
  label: string
  value: number
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}
