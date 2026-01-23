import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/shared/Providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quantum Pi Forge - Mint Your Soul\'s Digital Twin',
  description: 'Create intelligent NFTs from oracle readings. Connect your Pi wallet, receive quantum guidance, and mint living digital souls that evolve with you.',
  keywords: ['NFT', 'Pi Network', 'Oracle', 'Soul', 'Quantum', 'Blockchain', 'AI'],
  authors: [{ name: 'Quantum Pi Forge' }],
  openGraph: {
    title: 'Quantum Pi Forge',
    description: 'Mint Your Soul\'s Digital Twin',
    url: 'https://quantumpiforge.com',
    siteName: 'Quantum Pi Forge',
    images: [
      {
        url: '/forge-logo.svg',
        width: 1200,
        height: 630,
        alt: 'Quantum Pi Forge Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quantum Pi Forge',
    description: 'Mint Your Soul\'s Digital Twin',
    images: ['/forge-logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}