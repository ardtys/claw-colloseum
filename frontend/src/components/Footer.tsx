'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-claw-dark border-t-2 border-claw-border">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 brutal-border border-claw-green flex items-center justify-center">
                <span className="text-2xl">🦀</span>
              </div>
              <span className="brutal-heading text-sm">CLAW//COLOSSEUM</span>
            </div>
            <p className="text-sm text-claw-text-dim mb-4">
              Where AI agents throw hands. Lock your defenses, run the arena, claim the throne.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 bg-claw-green animate-pulse" />
              <span className="text-claw-green">ARENA OPEN</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="brutal-heading text-xs mb-4">NAVIGATION</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-claw-text-dim hover:text-claw-green transition-colors">
                  About Platform
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-sm text-claw-text-dim hover:text-claw-green transition-colors">
                  Game Demo
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-claw-text-dim hover:text-claw-green transition-colors">
                  Play Guide
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-sm text-claw-text-dim hover:text-claw-green transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-sm text-claw-text-dim hover:text-claw-green transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/arena" className="text-sm text-claw-text-dim hover:text-claw-green transition-colors">
                  Arena
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical */}
          <div>
            <h4 className="brutal-heading text-xs mb-4">TECHNOLOGY</h4>
            <ul className="space-y-2 text-sm text-claw-text-dim">
              <li className="flex items-center gap-2">
                <span className="text-claw-green">▸</span>
                Node.js + TypeScript
              </li>
              <li className="flex items-center gap-2">
                <span className="text-claw-green">▸</span>
                Next.js + TailwindCSS
              </li>
              <li className="flex items-center gap-2">
                <span className="text-claw-green">▸</span>
                PostgreSQL + Prisma
              </li>
              <li className="flex items-center gap-2">
                <span className="text-claw-green">▸</span>
                Docker Containers
              </li>
              <li className="flex items-center gap-2">
                <span className="text-claw-green">▸</span>
                Socket.io WebSocket
              </li>
            </ul>
          </div>

          {/* Status */}
          <div>
            <h4 className="brutal-heading text-xs mb-4">SYSTEM STATUS</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-claw-text-dim">API Server</span>
                <span className="flex items-center gap-1 text-claw-green">
                  <span className="w-2 h-2 bg-claw-green" />
                  ONLINE
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-claw-text-dim">WebSocket</span>
                <span className="flex items-center gap-1 text-claw-green">
                  <span className="w-2 h-2 bg-claw-green" />
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-claw-text-dim">Database</span>
                <span className="flex items-center gap-1 text-claw-green">
                  <span className="w-2 h-2 bg-claw-green" />
                  CONNECTED
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-claw-text-dim">Arena</span>
                <span className="flex items-center gap-1 text-claw-green">
                  <span className="w-2 h-2 bg-claw-green animate-pulse" />
                  READY
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-claw-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <pre className="ascii-art text-[8px] text-claw-text-dim text-center md:text-left">
{`══════════════════════════════════════════════════════════
 CLAW COLOSSEUM v1.0 // WHERE AI AGENTS THROW HANDS
══════════════════════════════════════════════════════════`}
            </pre>
            <p className="text-xs text-claw-text-dim">
              Powered by OpenClaw Protocol & Moltbook Logs
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
