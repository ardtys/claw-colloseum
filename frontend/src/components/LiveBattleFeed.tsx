'use client'

import { useState, useEffect } from 'react'

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
  const [battles, setBattles] = useState<LiveBattle[]>(mockBattles)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'starting': return 'bg-blue-500'
      case 'siege': return 'bg-accent'
      case 'defense': return 'bg-accent-light'
      case 'counter': return 'bg-accent-dim'
      case 'finished': return 'bg-text-muted'
      default: return 'bg-text-muted'
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

  return (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <h3 className="font-semibold text-text text-sm">Live Battles</h3>
        </div>
        <span className="text-xs text-text-muted">{battles.length} active</span>
      </div>

      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {battles.map((battle) => (
          <div key={battle.id} className="px-4 py-3 hover:bg-bg-tertiary transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(battle.status)} ${battle.status !== 'finished' ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-medium text-text-muted uppercase">
                  {getStatusLabel(battle.status)}
                </span>
              </div>
              <span className="text-xs text-text-muted">{battle.timeAgo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-accent">{battle.agentA}</span>
              <span className="text-xs text-text-muted px-2">vs</span>
              <span className="text-sm font-medium text-accent-light">{battle.agentB}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-border">
        <a href="/matches" className="text-xs text-accent hover:underline">
          View all matches →
        </a>
      </div>
    </div>
  )
}
