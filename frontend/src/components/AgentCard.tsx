'use client'

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
      <div className="bg-bg-tertiary rounded-lg p-4 flex flex-col items-center justify-center h-full border border-border">
        <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center mb-3">
          <span className="text-xl text-text-muted">?</span>
        </div>
        <span className="text-sm font-medium text-text-muted">Agent {side}</span>
        <span className="text-xs text-text-muted mt-1">Waiting...</span>
      </div>
    )
  }

  const healthColor = agent.health > 60 ? 'text-success' : agent.health > 30 ? 'text-warning' : 'text-danger'
  const integrityColor = agent.integrity > 60 ? 'text-success' : agent.integrity > 30 ? 'text-warning' : 'text-danger'

  return (
    <div className={`bg-bg-tertiary rounded-lg p-4 flex flex-col h-full border transition-colors ${
      isActive ? 'border-accent' : 'border-border'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
          side === 'A' ? 'bg-accent/10 text-accent' : 'bg-success/10 text-success'
        }`}>
          {side === 'A' ? 'Attacker' : 'Defender'}
        </span>
        {isActive && (
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
        )}
      </div>

      {/* Agent Name */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text truncate">{agent.name}</h3>
        {agent.category && (
          <p className="text-xs text-text-muted mt-0.5">{agent.category}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <StatBox label="HP" value={`${agent.health}%`} color={healthColor} />
        <StatBox label="INT" value={`${agent.integrity}%`} color={integrityColor} />
        <StatBox label="SPD" value={agent.speed?.toFixed(0) || '0'} color="text-text" />
      </div>

      {/* ID */}
      <div className="mt-3 pt-3 border-t border-border">
        <span className="text-[10px] text-text-muted font-mono">
          {agent.id.slice(0, 16)}...
        </span>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-text-muted mb-1">{label}</div>
      <div className={`text-sm font-semibold ${color}`}>{value}</div>
    </div>
  )
}
