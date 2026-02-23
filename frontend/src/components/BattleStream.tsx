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
  const [damageEffect, setDamageEffect] = useState<'A' | 'B' | null>(null)

  useEffect(() => {
    const lastEvent = events[events.length - 1]
    if (lastEvent?.action.includes('ATTACK')) {
      const attacker = lastEvent.actor === agentA?.id ? 'A' : 'B'
      setAttackLine(attacker)

      // Show damage effect on defender
      setTimeout(() => {
        setDamageEffect(attacker === 'A' ? 'B' : 'A')
      }, 150)

      setTimeout(() => {
        setAttackLine(null)
        setDamageEffect(null)
      }, 400)
    }
  }, [events, agentA?.id])

  if (!agentA || !agentB) {
    return (
      <motion.div
        className="h-full flex items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-bg-tertiary border border-border flex items-center justify-center"
            animate={{
              scale: [1, 1.05, 1],
              borderColor: ['rgba(63,63,70,1)', 'rgba(249,115,22,0.3)', 'rgba(63,63,70,1)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span
              className="text-3xl text-text-muted"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ?
            </motion.span>
          </motion.div>
          <h3 className="text-lg font-semibold text-text mb-1">Waiting for Match</h3>
          <p className="text-sm text-text-muted">Arena is ready for battle</p>
        </div>
      </motion.div>
    )
  }

  const getRoundBadgeStyle = (round: string) => {
    switch (round) {
      case 'SIEGE':
        return 'bg-danger/10 text-danger border-danger/20'
      case 'DEFENSE':
        return 'bg-success/10 text-success border-success/20'
      case 'COUNTER':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'JUDGMENT':
        return 'bg-accent/10 text-accent border-accent/20'
      default:
        return 'bg-bg-tertiary text-text-muted border-border'
    }
  }

  const getHealthColor = (health: number) => {
    if (health > 60) return 'text-success'
    if (health > 30) return 'text-warning'
    return 'text-danger'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Round Indicator */}
      <div className="text-center mb-6">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentRound}
            className={`inline-flex px-4 py-1.5 rounded-full text-sm font-medium border ${getRoundBadgeStyle(currentRound)}`}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {currentRound || 'READY'}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Battle Arena */}
      <div className="flex-1 relative flex items-center justify-between px-4 md:px-8">
        {/* Agent A */}
        <AgentNode
          name={agentA.name}
          health={agentA.health}
          side="A"
          isAttacking={attackLine === 'A'}
          isDamaged={damageEffect === 'A'}
          getHealthColor={getHealthColor}
        />

        {/* Connection / Battle Line */}
        <div className="flex-1 relative h-full flex items-center justify-center mx-4">
          {/* Base Line */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Attack Animation - Left to Right */}
          <AnimatePresence>
            {attackLine === 'A' && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-accent via-warning to-danger rounded-full"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          {/* Attack Animation - Right to Left */}
          <AnimatePresence>
            {attackLine === 'B' && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 right-0 h-1 bg-gradient-to-l from-success via-warning to-danger rounded-full"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          {/* Center Indicator */}
          <div className="absolute inset-0 flex justify-center items-center">
            {currentRound !== 'JUDGMENT' && (
              <motion.div
                className="w-3 h-3 rounded-full bg-accent"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>

          {/* VS Badge */}
          <motion.div
            className="relative z-10 bg-bg-secondary px-4 py-2 rounded-lg border border-border"
            animate={currentRound === 'COUNTER' ? {
              scale: [1, 1.1, 1],
              borderColor: ['rgba(63,63,70,1)', 'rgba(249,115,22,0.5)', 'rgba(63,63,70,1)'],
            } : {}}
            transition={{ duration: 0.5, repeat: currentRound === 'COUNTER' ? Infinity : 0 }}
          >
            <span className="text-lg font-bold text-text">VS</span>
          </motion.div>
        </div>

        {/* Agent B */}
        <AgentNode
          name={agentB.name}
          health={agentB.health}
          side="B"
          isAttacking={attackLine === 'B'}
          isDamaged={damageEffect === 'B'}
          getHealthColor={getHealthColor}
        />
      </div>

      {/* Last Action */}
      <div className="mt-6 text-center min-h-[2rem]">
        <AnimatePresence mode="wait">
          {events.length > 0 && (
            <motion.div
              key={events[events.length - 1]?.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-tertiary text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-text-muted">Last:</span>
              <span className="text-accent font-medium">
                {events[events.length - 1]?.action}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function AgentNode({
  name,
  health,
  side,
  isAttacking,
  isDamaged,
  getHealthColor,
}: {
  name: string
  health: number
  side: 'A' | 'B'
  isAttacking: boolean
  isDamaged: boolean
  getHealthColor: (health: number) => string
}) {
  const sideColor = side === 'A' ? 'border-accent bg-accent/10' : 'border-success bg-success/10'
  const attackColor = side === 'A' ? 'border-accent bg-accent/20' : 'border-success bg-success/20'

  return (
    <motion.div
      className="flex flex-col items-center"
      animate={isDamaged ? {
        x: [0, -5, 5, -5, 5, 0],
      } : {}}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 flex items-center justify-center transition-colors ${
          isAttacking ? attackColor : isDamaged ? 'border-danger bg-danger/10' : 'border-border bg-bg-tertiary'
        }`}
        animate={isAttacking ? {
          scale: [1, 1.15, 1],
        } : isDamaged ? {
          scale: [1, 0.95, 1],
        } : {}}
        transition={{ duration: 0.2 }}
      >
        <motion.span
          className={`text-2xl md:text-3xl font-bold ${
            isAttacking ? (side === 'A' ? 'text-accent' : 'text-success') : isDamaged ? 'text-danger' : 'text-text'
          }`}
          animate={isAttacking ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.2 }}
        >
          {side}
        </motion.span>
      </motion.div>

      <motion.span
        className="text-sm font-medium text-text mt-2 max-w-20 truncate text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {name}
      </motion.span>

      <motion.span
        className={`text-xs font-medium ${getHealthColor(health)}`}
        key={health}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {health}%
      </motion.span>

      {/* Damage Indicator */}
      <AnimatePresence>
        {isDamaged && (
          <motion.span
            className="absolute -top-2 text-danger font-bold text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            -DMG
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
