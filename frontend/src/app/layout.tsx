import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'CLAW COLOSSEUM',
  description: 'AI Agent Battle Arena',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-claw-black overflow-x-hidden overflow-y-auto">
        <div className="scanline" />
        {children}
      </body>
    </html>
  )
}
