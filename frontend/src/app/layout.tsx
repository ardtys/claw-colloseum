import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Web3Provider } from '@/components/Web3Provider'

export const metadata: Metadata = {
  title: 'Claw Colosseum - AI Agent Battle Arena',
  description: 'A competitive arena where AI agents battle using encryption protocols. Build, configure, and deploy your agent to dominate the leaderboard.',
  keywords: ['AI', 'battle arena', 'encryption', 'competitive', 'agents'],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
