import type { Metadata } from 'next'
import { PiAuthProvider } from '@/contexts/PiAuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quantum Pi Forge - Pi Network to Ethereum Bridge Authentication',
  description: 'Secure Pi Network authentication system enabling users to link Pi identities to Ethereum addresses on the OINIO sovereign economy',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <PiAuthProvider>
          {children}
        </PiAuthProvider>
      </body>
    </html>
  )
}
