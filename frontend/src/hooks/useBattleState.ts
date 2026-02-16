'use client'

import { useEffect, useState, useCallback } from 'react'
import { Socket } from 'socket.io-client'

interface Agent {
  id: string
  name: string
  health: number
  integrity: number
  speed: number
  category?: string
}

interface BattleState {
  matchId: string | null
  agentA: Agent | null
  agentB: Agent | null
  round: string
  timeRemaining: number
  winner: string | null
  scores: {
    agentId: string
    encryption: number
    attack: number
    speed: number
    total: number
  }[]
}

interface MoltEvent {
  id: string
  timestamp: number
  round: string
  actor: string
  action: string
  payload: Record<string, unknown>
  integrityHash: string
}

interface BattleMetrics {
  agentA: { health: number; integrity: number; speed: number }
  agentB: { health: number; integrity: number; speed: number }
  round: string
  timeRemaining: number
}

const initialState: BattleState = {
  matchId: null,
  agentA: null,
  agentB: null,
  round: 'WAITING',
  timeRemaining: 0,
  winner: null,
  scores: [],
}

export function useBattleState(socket: Socket | null) {
  const [battleState, setBattleState] = useState<BattleState>(initialState)
  const [events, setEvents] = useState<MoltEvent[]>([])

  useEffect(() => {
    if (!socket) return

    // Match started
    socket.on('match:start', (data: { matchId: string; agentA: { id: string; name: string }; agentB: { id: string; name: string } }) => {
      setBattleState((prev) => ({
        ...prev,
        matchId: data.matchId,
        agentA: {
          id: data.agentA.id,
          name: data.agentA.name,
          health: 100,
          integrity: 100,
          speed: 50,
        },
        agentB: {
          id: data.agentB.id,
          name: data.agentB.name,
          health: 100,
          integrity: 100,
          speed: 50,
        },
        round: 'PRE_MATCH',
        winner: null,
        scores: [],
      }))
      setEvents([])
    })

    // Real-time metrics update
    socket.on('match:metrics', (metrics: BattleMetrics) => {
      setBattleState((prev) => ({
        ...prev,
        round: metrics.round,
        timeRemaining: metrics.timeRemaining,
        agentA: prev.agentA
          ? { ...prev.agentA, ...metrics.agentA }
          : null,
        agentB: prev.agentB
          ? { ...prev.agentB, ...metrics.agentB }
          : null,
      }))
    })

    // New moltbook event
    socket.on('match:event', (event: MoltEvent) => {
      setEvents((prev) => [...prev, event])
    })

    // Match ended
    socket.on('match:end', (data: { matchId: string; scores: BattleState['scores']; winner: string | null }) => {
      setBattleState((prev) => ({
        ...prev,
        winner: data.winner,
        scores: data.scores,
        round: 'COMPLETED',
      }))
    })

    // Match found (from queue)
    socket.on('match:found', (data: { matchId: string; opponent: string }) => {
      console.log('[BATTLE] Match found:', data.matchId, 'vs', data.opponent)
    })

    return () => {
      socket.off('match:start')
      socket.off('match:metrics')
      socket.off('match:event')
      socket.off('match:end')
      socket.off('match:found')
    }
  }, [socket])

  const reset = useCallback(() => {
    setBattleState(initialState)
    setEvents([])
  }, [])

  return {
    battleState,
    events,
    reset,
  }
}
