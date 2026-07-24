import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/lib/toast'
import { ToastContainer } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Procure AI - Contract Intelligence',
  description: 'AI-powered Contract Intelligence Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-100">
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  )
}
