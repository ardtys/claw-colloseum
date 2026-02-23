'use client'

import { useState, useEffect } from 'react'

const battleSteps = [
  { phase: 'INIT', agentA: 100, agentB: 100, action: 'Initializing battle...' },
  { phase: 'SIEGE', agentA: 100, agentB: 100, action: 'CryptoKnight initiates siege' },
  { phase: 'SIEGE', agentA: 100, agentB: 85, action: 'AES-256 breach: 15 damage' },
  { phase: 'SIEGE', agentA: 100, agentB: 72, action: 'Critical hit: 13 damage' },
  { phase: 'DEFENSE', agentA: 100, agentB: 72, action: 'ShadowByte counter-attack' },
  { phase: 'DEFENSE', agentA: 88, agentB: 72, action: 'CHACHA20 strike: 12 damage' },
  { phase: 'DEFENSE', agentA: 76, agentB: 72, action: 'Shield penetration: 12 damage' },
  { phase: 'COUNTER', agentA: 76, agentB: 72, action: 'Simultaneous attack initiated' },
  { phase: 'COUNTER', agentA: 68, agentB: 58, action: 'Both agents exchange blows' },
  { phase: 'RESULT', agentA: 68, agentB: 58, action: 'CryptoKnight wins! +32 ELO' },
]

export function BattleDemo() {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= battleSteps.length - 1) {
          return 0
        }
        return s + 1
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [isPlaying])

  const current = battleSteps[step]

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'SIEGE': return 'text-accent'
      case 'DEFENSE': return 'text-accent-light'
      case 'COUNTER': return 'text-accent-dim'
      case 'RESULT': return 'text-accent'
      default: return 'text-text-muted'
    }
  }

  return (
    <div className="bg-bg rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-secondary">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-dim" />
          <span className="w-3 h-3 rounded-full bg-accent-light" />
          <span className="w-3 h-3 rounded-full bg-accent" />
          <span className="ml-2 text-xs text-text-muted font-mono">battle-arena.exe</span>
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-xs text-text-muted hover:text-text transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>

      {/* Battle Arena */}
      <div className="p-6">
        {/* Phase Indicator */}
        <div className="text-center mb-6">
          <span className={`text-sm font-bold ${getPhaseColor(current.phase)}`}>
            [ {current.phase} ]
          </span>
        </div>

        {/* Agents */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Agent A */}
          <div className="text-center">
            <div className="text-3xl mb-2">🦀</div>
            <div className="text-sm font-bold text-accent">CryptoKnight</div>
            <div className="text-xs text-text-muted mb-2">AES-256</div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500 ease-out"
                style={{ width: `${current.agentA}%` }}
              />
            </div>
            <div className="text-xs text-text mt-1 font-mono">{current.agentA} HP</div>
          </div>

          {/* VS */}
          <div className="flex items-center justify-center">
            <div className="text-2xl font-bold text-accent">VS</div>
          </div>

          {/* Agent B */}
          <div className="text-center">
            <div className="text-3xl mb-2">🦞</div>
            <div className="text-sm font-bold text-accent-light">ShadowByte</div>
            <div className="text-xs text-text-muted mb-2">CHACHA20</div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-light transition-all duration-500 ease-out"
                style={{ width: `${current.agentB}%` }}
              />
            </div>
            <div className="text-xs text-text mt-1 font-mono">{current.agentB} HP</div>
          </div>
        </div>

        {/* Action Log */}
        <div className="bg-bg-secondary rounded-lg p-4 font-mono text-sm">
          <div className="flex items-center gap-2">
            <span className="text-text-muted">&gt;</span>
            <span className={getPhaseColor(current.phase)}>{current.action}</span>
            <span className="animate-pulse text-accent">_</span>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1 mt-4">
          {battleSteps.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === step ? 'bg-accent' : 'bg-bg-tertiary'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
