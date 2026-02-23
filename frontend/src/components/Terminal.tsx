'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MoltEvent {
  id: string
  timestamp: number
  round: string
  actor: string
  action: string
  payload: Record<string, unknown>
}

interface TerminalProps {
  events: MoltEvent[]
}

export function Terminal({ events }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [events])

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts)
    return date.toISOString().split('T')[1].slice(0, 12)
  }

  const getActionColor = (action: string): string => {
    if (action.includes('ATTACK') || action.includes('STRIKE') || action.includes('DAMAGE')) {
      return 'text-danger'
    }
    if (action.includes('DEFENSE') || action.includes('SHIELD') || action.includes('GUARD')) {
      return 'text-success'
    }
    if (action.includes('WINNER') || action.includes('VICTORY')) {
      return 'text-accent font-semibold'
    }
    if (action.includes('BREACH') || action.includes('CRITICAL')) {
      return 'text-warning'
    }
    return 'text-text-secondary'
  }

  const getRoundColor = (round: string): string => {
    switch (round) {
      case 'SIEGE':
        return 'text-danger'
      case 'DEFENSE':
        return 'text-success'
      case 'COUNTER':
        return 'text-warning'
      case 'JUDGMENT':
        return 'text-accent'
      default:
        return 'text-text-muted'
    }
  }

  const formatPayload = (payload: Record<string, unknown>): string => {
    const entries = Object.entries(payload).slice(0, 3)
    if (entries.length === 0) return ''
    return entries
      .map(([key, value]) => {
        const v = typeof value === 'number' ? value : String(value).slice(0, 10)
        return `${key}=${v}`
      })
      .join(' ')
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto custom-scrollbar bg-bg-tertiary rounded-lg p-3 font-mono text-xs"
    >
      {events.length === 0 ? (
        <motion.div
          className="flex items-center justify-center h-full text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span>Waiting for events...</span>
          <motion.span
            className="ml-1 w-2 h-4 bg-text-muted inline-block"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                className="flex items-start gap-2 leading-relaxed"
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-text-muted shrink-0">
                  [{formatTimestamp(event.timestamp)}]
                </span>
                <motion.span
                  className={`shrink-0 ${getRoundColor(event.round)}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  [{event.round}]
                </motion.span>
                <span className="text-text shrink-0">
                  {event.actor.length > 8 ? `${event.actor.slice(0, 8)}...` : event.actor}
                </span>
                <motion.span
                  className={getActionColor(event.action)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {event.action}
                </motion.span>
                {Object.keys(event.payload).length > 0 && (
                  <motion.span
                    className="text-text-muted truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {formatPayload(event.payload)}
                  </motion.span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div
            className="flex items-center text-text-muted pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span>$</span>
            <motion.span
              className="ml-1 w-2 h-4 bg-accent inline-block"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.div>
        </div>
      )}
    </div>
  )
}
