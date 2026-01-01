import type { Metadata } from 'next'
import './globals.css'
import TracingProvider from './tracing-provider'

export const metadata: Metadata = {
  title: 'OINIO - Sovereign Staking',
  description: 'Gasless staking for the sovereign economy. No fees, no friction.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/oinio-logo.svg', sizes: '32x32', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  openGraph: {
    title: 'OINIO - Sovereign Staking',
    description: 'Gasless staking for the sovereign economy. No fees, no friction.',
    images: [
      {
        url: '/oinio-logo.svg',
        width: 200,
        height: 200,
        alt: 'OINIO Logo - Quantum Pi Forge',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'OINIO - Sovereign Staking',
    description: 'Gasless staking for the sovereign economy. No fees, no friction.',
    images: ['/oinio-logo.svg'],
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
