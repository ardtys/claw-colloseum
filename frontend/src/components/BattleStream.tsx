'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Agent {
  id: string
  name: string
  health: number
  integrity: number
}

interface MoltEvent {
  id: string
  action: string
  actor: string
  payload: Record<string, unknown>
}

interface BattleStreamProps {
  agentA?: Agent | null
  agentB?: Agent | null
  currentRound: string
  events: MoltEvent[]
}

export function BattleStream({ agentA, agentB, currentRound, events }: BattleStreamProps) {
  const [attackLine, setAttackLine] = useState<'A' | 'B' | null>(null)

  useEffect(() => {
    const lastEvent = events[events.length - 1]
    if (lastEvent?.action.includes('ATTACK')) {
      const attacker = lastEvent.actor === agentA?.id ? 'A' : 'B'
      setAttackLine(attacker)
      setTimeout(() => setAttackLine(null), 300)
    }
  }, [events, agentA?.id])

  if (!agentA || !agentB) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl sm:text-5xl mb-4 brutal-heading text-claw-green">[  ]</div>
          <div className="brutal-heading text-sm sm:text-base mb-2">AWAITING AGENTS...</div>
          <div className="text-xs sm:text-sm text-claw-text-dim">Arena is ready</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Round Indicator */}
      <div className="text-center mb-2 md:mb-4">
        <span className="brutal-heading text-sm sm:text-lg md:text-xl text-glow-green">
          {currentRound}
        </span>
      </div>

      {/* Battle Arena */}
      <div className="flex-1 relative flex items-center justify-between px-2 sm:px-4 md:px-8">
        {/* Agent A Node */}
        <div className="flex flex-col items-center">
          <motion.div
            className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 brutal-border flex items-center justify-center ${
              attackLine === 'A' ? 'border-claw-orange border-glow-coral' : 'border-claw-green'
            }`}
            animate={{
              scale: attackLine === 'A' ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.1 }}
          >
            <span className="text-xl sm:text-2xl md:text-3xl brutal-heading text-claw-green">[A]</span>
          </motion.div>
          <span className="data-label mt-1 sm:mt-2 text-center max-w-16 sm:max-w-24 truncate text-[10px] sm:text-xs">
            {agentA.name}
          </span>
          <span className="text-[10px] sm:text-xs text-claw-green">
            HP {agentA.health}%
          </span>
        </div>

        {/* Connection Lines */}
        <div className="flex-1 relative h-full flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
            {/* Base connection line */}
            <line
              x1="10" y1="50" x2="190" y2="50"
              stroke="#333333"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Claw Attack animation line */}
            <AnimatePresence>
              {attackLine && (
                <motion.line
                  x1={attackLine === 'A' ? '10' : '190'}
                  y1="50"
                  x2={attackLine === 'A' ? '190' : '10'}
                  y2="50"
                  stroke={attackLine === 'A' ? '#FF6B35' : '#FF7F50'}
                  strokeWidth="3"
                  initial={{ pathLength: 0, opacity: 1 }}
                  animate={{ pathLength: 1, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'linear' }}
                />
              )}
            </AnimatePresence>

            {/* Claw energy bursts */}
            {currentRound !== 'JUDGMENT' && (
              <>
                <motion.circle
                  cx="100"
                  cy="50"
                  r="4"
                  fill="#FF6B35"
                  animate={{ cx: [30, 170, 30] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.circle
                  cx="100"
                  cy="50"
                  r="3"
                  fill="#FF7F50"
                  animate={{ cx: [170, 30, 170] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
              </>
            )}
          </svg>

          {/* VS Text */}
          <span className="brutal-heading text-lg sm:text-xl md:text-2xl text-claw-orange z-10">
            VS
          </span>
        </div>

        {/* Agent B Node */}
        <div className="flex flex-col items-center">
          <motion.div
            className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 brutal-border flex items-center justify-center ${
              attackLine === 'B' ? 'border-claw-orange border-glow-coral' : 'border-claw-green'
            }`}
            animate={{
              scale: attackLine === 'B' ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.1 }}
          >
            <span className="text-xl sm:text-2xl md:text-3xl brutal-heading text-claw-green">[B]</span>
          </motion.div>
          <span className="data-label mt-1 sm:mt-2 text-center max-w-16 sm:max-w-24 truncate text-[10px] sm:text-xs">
            {agentB.name}
          </span>
          <span className="text-[10px] sm:text-xs text-claw-green">
            HP {agentB.health}%
          </span>
        </div>
      </div>

      {/* Recent Action */}
      <div className="mt-4 text-center">
        <AnimatePresence mode="wait">
          {events.length > 0 && (
            <motion.div
              key={events[events.length - 1]?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.1 }}
              className="terminal-text"
            >
              <span className="text-claw-orange">
                {events[events.length - 1]?.action}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
