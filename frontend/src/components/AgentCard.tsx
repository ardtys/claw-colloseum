'use client'

import { motion } from 'framer-motion'
import { IntegrityBar } from './HealthBar'

interface Agent {
  id: string
  name: string
  category?: string
  health: number
  integrity: number
  speed?: number
}

interface AgentCardProps {
  agent?: Agent | null
  side: 'A' | 'B'
  isActive?: boolean
}

export function AgentCard({ agent, side, isActive = false }: AgentCardProps) {
  if (!agent) {
    return (
      <div className="brutal-border bg-claw-dark p-3 flex flex-col items-center justify-center h-full opacity-50">
        <pre className="ascii-art text-xs mb-2">
{`╔═════════╗
║   [?]   ║
╚═════════╝`}
        </pre>
        <span className="data-label">AGENT {side}</span>
        <span className="text-xs text-claw-text-dim mt-1">WAITING...</span>
      </div>
    )
  }

  return (
    <motion.div
      className={`brutal-border bg-claw-dark p-3 flex flex-col h-full ${
        isActive ? 'border-claw-green' : ''
      }`}
      animate={{
        borderColor: isActive ? '#FF6B35' : '#2d1f1a',
      }}
      transition={{ duration: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`brutal-heading text-sm ${side === 'A' ? 'text-claw-green' : 'text-claw-orange'}`}>
          AGENT {side}
        </span>
        {isActive && (
          <span className="w-2 h-2 bg-claw-green animate-pulse" />
        )}
      </div>

      {/* Agent Name */}
      <div className="mb-3">
        <span className="data-label">NAME</span>
        <p className="text-lg font-bold text-claw-text truncate">
          {agent.name}
        </p>
      </div>

      {/* Category */}
      {agent.category && (
        <div className="mb-3">
          <span className="data-label">TYPE</span>
          <p className="text-sm text-claw-text-dim uppercase">
            {agent.category}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="space-y-2 mt-auto">
        <IntegrityBar value={agent.integrity} label="INTEGRITY" />

        <div className="flex gap-4 mt-3">
          <div>
            <span className="data-label">HP</span>
            <p className={`data-value ${agent.health <= 30 ? 'text-claw-red' : 'text-claw-green'}`}>
              {agent.health}%
            </p>
          </div>
          <div>
            <span className="data-label">SPD</span>
            <p className="data-value text-claw-green">
              {agent.speed?.toFixed(0) || '0'}
            </p>
          </div>
        </div>
      </div>

      {/* ID */}
      <div className="mt-3 pt-2 border-t border-claw-border">
        <span className="text-[10px] text-claw-text-dim font-mono">
          ID: {agent.id.slice(0, 12)}...
        </span>
      </div>
    </motion.div>
  )
}
