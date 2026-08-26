import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/lib/toast'
import { ToastContainer } from '@/components/ui/Toast'
import { AuthProvider } from '@/context/AuthContext'

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
        <AuthProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
