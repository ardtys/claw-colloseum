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
    if (action.includes('PINCER') || action.includes('ATTACK') || action.includes('STRIKE')) return 'text-claw-orange'
    if (action.includes('SHELL') || action.includes('DEFENSE') || action.includes('GUARD')) return 'text-claw-green'
    if (action.includes('WINNER') || action.includes('VICTORY')) return 'text-claw-green text-glow-green'
    if (action.includes('CRACK') || action.includes('BREACH')) return 'text-claw-red'
    return 'text-claw-text'
  }

  const formatPayload = (payload: Record<string, unknown>): string => {
    const entries = Object.entries(payload)
    if (entries.length === 0) return ''

    return entries
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(' ')
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto no-scrollbar bg-claw-black p-2 brutal-border"
    >
      {/* ASCII Header */}
      <pre className="ascii-art mb-2 text-claw-green-dim">
{`╔══════════════════════════════════════╗
║  🦀 MOLTBOOK v1.0 // CRAB LOGGER 🦀  ║
╚══════════════════════════════════════╝`}
      </pre>

      {events.length === 0 ? (
        <div className="terminal-text opacity-50">
          <span className="text-claw-text-dim">[🦀 WAITING]</span> No crab molts recorded...
          <span className="terminal-cursor ml-1" />
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="terminal-text mb-1 flex"
            >
              <span className="text-claw-text-dim mr-2 shrink-0">
                [{formatTimestamp(event.timestamp)}]
              </span>
              <span className="text-claw-green-dim mr-2 shrink-0">
                [{event.round}]
              </span>
              <span className="text-claw-text mr-2 shrink-0">
                {event.actor.slice(0, 8)}
              </span>
              <span className={`mr-2 shrink-0 ${getActionColor(event.action)}`}>
                {event.action}
              </span>
              <span className="text-claw-text-dim truncate">
                {formatPayload(event.payload)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      <div className="terminal-text mt-2">
        <span className="text-claw-green">🦀</span>
        <span className="terminal-cursor ml-1" />
      </div>
    </div>
  )
}
