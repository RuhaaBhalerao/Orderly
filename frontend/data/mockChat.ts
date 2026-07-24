export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export const mockChatHistory: ChatMessage[] = [
  {
    id: 'msg-1',
    type: 'user',
    content: 'What are the payment terms?',
    timestamp: new Date('2025-05-26T14:22:00'),
  },
  {
    id: 'msg-2',
    type: 'ai',
    content:
      'According to Section 5.1, the payment terms are Net 30. This means invoices are due within 30 days of receipt. The contract specifies that payments should be made to the account detailed in the invoice.',
    timestamp: new Date('2025-05-26T14:22:30'),
  },
  {
    id: 'msg-3',
    type: 'user',
    content: 'Does it auto-renew?',
    timestamp: new Date('2025-05-26T14:23:15'),
  },
  {
    id: 'msg-4',
    type: 'ai',
    content:
      "Yes, the agreement automatically renews for another 12-month term unless terminated at least 30 days before the expiration date (June 30, 2027). You'll need to proactively manage this renewal or risk being locked into another year.",
    timestamp: new Date('2025-05-26T14:23:45'),
  },
]
