'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react'
import { getContractById } from '@/data/mockContracts'
import { RiskBadge } from '@/components/shared/RiskBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { Card, CardContent, CardHeader } from '@/components/shared/Card'
import { ChatMessage as ChatMessageType } from '@/types'
import { chatAPI } from '@/lib/api'
import Link from 'next/link'

export default function ContractDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string

  const contract = getContractById(contractId)
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      setIsLoading(true)
      const response = await chatAPI.getHistory(contractId)
      
      if (!response.error && response.data) {
        // Convert API response to ChatMessageType format
        const messages = response.data.map((msg: any) => [
          {
            id: `${msg.id}-user`,
            type: 'user' as const,
            content: msg.userMessage,
            timestamp: new Date(msg.timestamp),
          },
          {
            id: `${msg.id}-ai`,
            type: 'ai' as const,
            content: msg.aiResponse,
            timestamp: new Date(msg.timestamp),
          },
        ]).flat()
        setChatMessages(messages)
      }
      setIsLoading(false)
    }

    if (contractId) {
      loadChatHistory()
    }
  }, [contractId])

  if (!contract) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Contract not found
          </h2>
          <Link href="/contracts">
            <button className="mt-4 text-primary hover:text-primary-dark font-medium">
              Back to Contracts
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return

    const userMessageText = inputValue
    setInputValue('')
    setIsSending(true)
    setError('')

    // Add user message immediately
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: userMessageText,
      timestamp: new Date(),
    }
    setChatMessages(prev => [...prev, userMessage])

    // Send to backend
    const response = await chatAPI.sendMessage(contractId, userMessageText)
    
    if (response.error) {
      setError(response.error)
      setIsSending(false)
      return
    }

    if (response.data) {
      // Add AI response
      const aiMessage: ChatMessageType = {
        id: `msg-${Date.now() + 1}`,
        type: 'ai',
        content: response.data.aiResponse,
        timestamp: new Date(response.data.timestamp),
      }
      setChatMessages(prev => [...prev, aiMessage])
    }

    setIsSending(false)
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Contracts
        </button>
      </div>

      {/* Contract Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {contract.vendor}
            </h1>
            <p className="text-gray-600 mt-1">{contract.subject}</p>
          </div>
          <div className="flex gap-3">
            <RiskBadge risk={contract.risk} />
            <StatusBadge status={contract.status} />
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Received {contract.received}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Summary */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                AI Summary
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {contract.summary.map((point, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Extracted Fields */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Contract Details
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Contract Type
                  </label>
                  <p className="text-gray-900 font-medium">
                    {contract.contractType}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Vendor
                  </label>
                  <p className="text-gray-900 font-medium">{contract.vendor}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Effective Date
                  </label>
                  <p className="text-gray-900 font-medium">
                    {contract.effectiveDate}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Expiry Date
                  </label>
                  <p className="text-gray-900 font-medium">
                    {contract.expiryDate}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Payment Terms
                  </label>
                  <p className="text-gray-900 font-medium">
                    {contract.paymentTerms}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Renewal
                  </label>
                  <p className="text-gray-900 font-medium">{contract.renewal}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Termination Notice
                  </label>
                  <p className="text-gray-900 font-medium">
                    {contract.terminationNotice}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risks */}
          {contract.risks.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Identified Risks
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {contract.risks.map(risk => (
                  <div
                    key={risk.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      risk.severity === 'high'
                        ? 'bg-red-50 border-red-500'
                        : risk.severity === 'medium'
                          ? 'bg-amber-50 border-amber-500'
                          : 'bg-emerald-50 border-emerald-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {risk.description}
                      </h3>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          risk.severity === 'high'
                            ? 'bg-red-100 text-red-700'
                            : risk.severity === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {risk.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Location:</span> {risk.location}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Recommendation:</span>{' '}
                      {risk.recommendation}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* PDF Viewer Placeholder */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Contract Document
              </h2>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-12 flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">
                  {contract.subject}.pdf
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  PDF preview will be integrated with backend
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chat */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Ask Questions
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Get answers about this contract
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="animate-pulse mb-2">Loading chat history...</div>
                  </div>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Ask a question to get started</p>
                  </div>
                </div>
              ) : (
                chatMessages.map(message => (
                  <ChatMessage key={message.id} message={message} />
                ))
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask a question..."
                  disabled={isSending}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isSending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
