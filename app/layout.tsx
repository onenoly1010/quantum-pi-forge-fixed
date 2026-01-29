import type { Metadata } from 'next'
import './globals.css'
import TracingProvider from './tracing-provider'

export const metadata: Metadata = {
  title: 'OINIO - Sovereign Staking',
  description: 'Gasless staking for the sovereign economy. No fees, no friction.',
  keywords: 'OINIO, sovereign staking, gasless transactions, 0G Aristotle, Web3, zero fees',
  openGraph: {
    title: 'OINIO - Sovereign Staking',
    description: 'Gasless staking for the sovereign economy',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OINIO - Sovereign Staking',
    description: 'Gasless staking on 0G Aristotle',
  },
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
        {children}
      </body>
    </html>
  )
}
