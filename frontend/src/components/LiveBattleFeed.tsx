'use client'

import { useState } from 'react'
import Link from 'next/link'

interface LiveBattle {
  id: string
  agentA: string
  agentB: string
  status: 'starting' | 'siege' | 'defense' | 'counter' | 'finished'
  timeAgo: string
}

const mockBattles: LiveBattle[] = [
  { id: '1', agentA: 'CryptoKnight', agentB: 'ShadowByte', status: 'siege', timeAgo: 'now' },
  { id: '2', agentA: 'IronShield', agentB: 'NexusCore', status: 'defense', timeAgo: '2m ago' },
  { id: '3', agentA: 'PhantomAES', agentB: 'VaultBreaker', status: 'finished', timeAgo: '5m ago' },
  { id: '4', agentA: 'Citadel', agentB: 'QuantumNode', status: 'counter', timeAgo: '8m ago' },
]

export function LiveBattleFeed() {
  const [battles] = useState<LiveBattle[]>(mockBattles)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'starting': return 'bg-blue-500'
      case 'siege': return 'bg-accent'
      case 'defense': return 'bg-accent-light'
      case 'counter': return 'bg-yellow-500'
      case 'finished': return 'bg-text-muted'
      default: return 'bg-text-muted'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'starting': return 'text-blue-500'
      case 'siege': return 'text-accent'
      case 'defense': return 'text-accent-light'
      case 'counter': return 'text-yellow-500'
      case 'finished': return 'text-text-muted'
      default: return 'text-text-muted'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'starting': return 'Starting'
      case 'siege': return 'Siege'
      case 'defense': return 'Defense'
      case 'counter': return 'Counter'
      case 'finished': return 'Finished'
      default: return status
    }
  }

  const activeBattles = battles.filter(b => b.status !== 'finished').length

  return (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-tertiary/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <h3 className="font-semibold text-text">Live Battles</h3>
        </div>
        <span className="text-xs text-text-muted px-2 py-1 bg-bg-tertiary rounded-full">
          {activeBattles} active
        </span>
      </div>

      {/* Battle List */}
      <div className="divide-y divide-border">
        {battles.map((battle) => (
          <Link
            key={battle.id}
            href={`/matches/${battle.id}`}
            className="block px-4 py-4 hover:bg-bg-tertiary/50 transition-colors"
          >
            {/* Status Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(battle.status)} ${battle.status !== 'finished' ? 'animate-pulse' : ''}`} />
                <span className={`text-xs font-semibold uppercase tracking-wide ${getStatusTextColor(battle.status)}`}>
                  {getStatusLabel(battle.status)}
                </span>
              </div>
              <span className="text-xs text-text-muted">{battle.timeAgo}</span>
            </div>

            {/* Battle Matchup */}
            <div className="flex items-center justify-between bg-bg-tertiary/30 rounded-lg p-3">
              <div className="flex-1 text-left">
                <span className="text-sm font-semibold text-accent">{battle.agentA}</span>
              </div>
              <div className="px-4">
                <span className="text-xs font-bold text-text-muted bg-bg px-2 py-1 rounded">VS</span>
              </div>
              <div className="flex-1 text-right">
                <span className="text-sm font-semibold text-accent-light">{battle.agentB}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-bg-tertiary/30">
        <Link
          href="/matches"
          className="flex items-center justify-center gap-2 text-sm text-accent hover:text-accent-light transition-colors"
        >
          <span>View all matches</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
