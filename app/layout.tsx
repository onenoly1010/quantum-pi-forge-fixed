import type { Metadata } from 'next'
import './globals.css'
import TracingProvider from './tracing-provider'
import { PiAuthProvider } from '@/contexts/PiAuthContext'

export const metadata: Metadata = {
  title: 'OINIO - Sovereign Staking',
  description: 'Gasless staking for the sovereign economy. No fees, no friction.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* OINIO - Standing on our own merit */}
      </head>
      <body className="font-sans antialiased">
        <TracingProvider />
        <PiAuthProvider>
          {children}
        </PiAuthProvider>
      </body>
    </html>
  )
}
