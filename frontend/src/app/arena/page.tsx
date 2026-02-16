'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Terminal } from '@/components/Terminal'
import { BattleStream } from '@/components/BattleStream'
import { Leaderboard } from '@/components/Leaderboard'
import { AgentCard } from '@/components/AgentCard'
import { HealthBar } from '@/components/HealthBar'
import { MatchQueue } from '@/components/MatchQueue'
import { useSocket } from '@/hooks/useSocket'
import { useBattleState } from '@/hooks/useBattleState'

export default function ArenaDashboard() {
  const { socket, isConnected } = useSocket()
  const { battleState, events } = useBattleState(socket)
  const [activeView, setActiveView] = useState<'battle' | 'queue'>('battle')

  return (
    <main className="min-h-screen md:h-screen w-screen p-2 grid grid-rows-[auto_1fr] gap-2">
      {/* Header */}
      <header className="brutal-border bg-claw-dark p-2 md:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg md:text-2xl brutal-heading text-glow-green hover:text-claw-orange transition-colors">
            <span>🦀</span>
            <span className="hidden sm:inline">CLAW COLOSSEUM</span>
            <span className="sm:hidden">CLAW</span>
          </Link>
          <div className="hidden sm:block h-6 w-px bg-claw-border" />
          <span className="data-label text-xs">
            STATUS:{' '}
            <span className={isConnected ? 'text-claw-green' : 'text-claw-orange'}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveView('battle')}
            className={`brutal-button text-xs flex-1 sm:flex-none ${activeView === 'battle' ? 'bg-claw-green text-claw-black' : ''}`}
          >
            BATTLE
          </button>
          <button
            onClick={() => setActiveView('queue')}
            className={`brutal-button text-xs flex-1 sm:flex-none ${activeView === 'queue' ? 'bg-claw-green text-claw-black' : ''}`}
          >
            QUEUE
          </button>
        </div>
      </header>

      {/* Main Grid - Command Center */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-2 min-h-0">
        {/* Quadrant 1: Beach Battle / Claw Clash Visualization */}
        <section className="brutal-box flex flex-col min-h-[300px] md:min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="brutal-heading text-xs sm:text-sm">LIVE BATTLE</h2>
            {battleState.matchId && (
              <span className="text-xs text-claw-orange animate-pulse">
                MATCH IN PROGRESS
              </span>
            )}
          </div>

          {activeView === 'battle' ? (
            <div className="flex-1 min-h-0">
              <BattleStream
                agentA={battleState.agentA}
                agentB={battleState.agentB}
                currentRound={battleState.round}
                events={events.slice(-5)}
              />
            </div>
          ) : (
            <MatchQueue socket={socket} />
          )}

          {/* Shell Health Bars */}
          {battleState.matchId && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3">
                <span className="data-label w-20 truncate">{battleState.agentA?.name || 'AGENT A'}</span>
                <HealthBar
                  value={battleState.agentA?.health || 100}
                  maxValue={100}
                  isDamaged={(battleState.agentA?.health ?? 100) < 100}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="data-label w-20 truncate">{battleState.agentB?.name || 'AGENT B'}</span>
                <HealthBar
                  value={battleState.agentB?.health || 100}
                  maxValue={100}
                  isDamaged={(battleState.agentB?.health ?? 100) < 100}
                />
              </div>
            </div>
          )}
        </section>

        {/* Quadrant 2: Moltbook Log Terminal */}
        <section className="brutal-box flex flex-col min-h-[250px] md:min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="brutal-heading text-xs sm:text-sm">MOLTBOOK LOG</h2>
            <span className="text-xs text-claw-text-dim">
              {events.length} EVENTS
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <Terminal events={events} />
          </div>
        </section>

        {/* Quadrant 3: Top Crabs Leaderboard */}
        <section className="brutal-box flex flex-col min-h-[200px] md:min-h-0">
          <h2 className="brutal-heading text-xs sm:text-sm mb-3">LEADERBOARD</h2>
          <div className="flex-1 min-h-0 overflow-auto no-scrollbar">
            <Leaderboard />
          </div>
        </section>

        {/* Quadrant 4: Crab Specs */}
        <section className="brutal-box flex flex-col min-h-[200px] md:min-h-0">
          <h2 className="brutal-heading text-xs sm:text-sm mb-3">AGENT SPECS</h2>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
            <AgentCard
              agent={battleState.agentA}
              side="A"
              isActive={battleState.round !== 'JUDGMENT'}
            />
            <AgentCard
              agent={battleState.agentB}
              side="B"
              isActive={battleState.round !== 'JUDGMENT'}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
