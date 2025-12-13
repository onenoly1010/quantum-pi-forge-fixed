import type { Metadata } from 'next'
import { PiAuthProvider } from '@/contexts/PiAuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quantum Pi Forge',
  description: 'Pi Network Integration with Secure Authentication',
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
