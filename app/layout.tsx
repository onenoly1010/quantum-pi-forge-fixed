import type { Metadata } from 'next'
<<<<<<< HEAD
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pi Forge Quantum Genesis - Quantum-Inspired Pi Mining • Zero Fees • 5.5% APY',
  description: 'Compute Pi digits using quantum-inspired algorithms. Stake tokens at 5.5% APY. Gasless on Polygon. No installation required.',
  keywords: 'Pi mining, quantum computing, crypto staking, Polygon, Web3, zero fees',
  openGraph: {
    title: 'Pi Forge Quantum Genesis',
    description: 'Quantum-inspired Pi mining with 5.5% APY staking',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pi Forge Quantum Genesis',
    description: 'Quantum Pi mining with zero gas fees',
  },
=======
import './globals.css'
import TracingProvider from './tracing-provider'

export const metadata: Metadata = {
  title: 'OINIO - Sovereign Staking',
  description: 'Gasless staking for the sovereign economy. No fees, no friction.',
>>>>>>> fix/dep-ci-uvicorn-port
}

export default function RootLayout({
  children,
<<<<<<< HEAD
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* A-Frame for VR */}
        <script src="https://aframe.io/releases/1.4.0/aframe.min.js" async></script>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#FF6200" />
      </head>
      <body className={`${inter.className} bg-gradient-to-b from-gray-50 to-white min-h-screen`}>
        <div className="relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-float" style={{animationDelay: '4s'}}></div>
          </div>

          <main className="relative z-10">
            {children}
          </main>
        </div>
=======
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
>>>>>>> fix/dep-ci-uvicorn-port
      </body>
    </html>
  )
}
