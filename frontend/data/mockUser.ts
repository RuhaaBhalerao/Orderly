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

export const mockUser: User = {
  id: 'user-1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@acme.com',
  title: 'Procurement Manager',
  company: 'Acme Corporation',
  avatar: 'S',
  gmailConnected: true,
  gmailEmail: 'sarah@acme.com',
  lastSync: '2 minutes ago',
}
