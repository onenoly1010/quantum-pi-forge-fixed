import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quantum Pi Forge',
  description: 'Pi Network powered quantum application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://sdk.minepi.com/pi-sdk.js" async></script>
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
