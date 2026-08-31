import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/lib/toast'
import { ToastContainer } from '@/components/ui/Toast'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'Orderly - Enterprise Procurement Platform',
  description: 'Orderly Procurement & Supplier Comparison System',
  icons: {
    icon: '/orderly-icon.png',
    shortcut: '/orderly-icon.png',
    apple: '/orderly-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/orderly-icon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/orderly-icon.png" />
      </head>
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
