'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/shared/Card'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatMessage as ChatMessageType } from '@/types'
import { Send } from 'lucide-react'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      type: 'ai',
      content:
        'Hello! I can help you analyze and understand your contracts. You can ask me questions about specific contracts or get general insights about your contract portfolio.',
      timestamp: new Date(),
    },
  ])

  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    const aiMessage: ChatMessageType = {
      id: `msg-${Date.now() + 1}`,
      type: 'ai',
      content:
        'This is a simulated AI response. When connected to the backend, I will provide analysis based on your contract data.',
      timestamp: new Date(Date.now() + 1000),
    }

    setMessages([...messages, userMessage, aiMessage])
    setInputValue('')
  }

  return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl">
        <Card className="h-96 flex flex-col">
          <CardHeader>
            <h1 className="text-2xl font-bold text-gray-900">AI Chat</h1>
            <p className="text-gray-600 mt-1">
              Ask questions about your contracts
            </p>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
