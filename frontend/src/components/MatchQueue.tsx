'use client'

import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'

interface QueueAgent {
  name: string
  position: number
  waitTime?: number
}

interface QueueStatus {
  total: number
  agents: QueueAgent[]
}

interface MatchQueueProps {
  socket: Socket | null
}

export function MatchQueue({ socket }: MatchQueueProps) {
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({ total: 0, agents: [] })
  const [myPosition, setMyPosition] = useState<number | null>(null)
  const [agentId, setAgentId] = useState('')
  const [isQueued, setIsQueued] = useState(false)

  useEffect(() => {
    if (!socket) return

    socket.on('queue:update', (status: QueueStatus) => {
      setQueueStatus(status)
    })

    socket.on('queue:joined', (data: { position: number; agentId: string }) => {
      setMyPosition(data.position)
      setIsQueued(true)
    })

    socket.on('queue:left', () => {
      setMyPosition(null)
      setIsQueued(false)
    })

    socket.on('match:found', () => {
      setIsQueued(false)
      setMyPosition(null)
    })

    return () => {
      socket.off('queue:update')
      socket.off('queue:joined')
      socket.off('queue:left')
      socket.off('match:found')
    }
  }, [socket])

  const handleJoinQueue = () => {
    if (!socket || !agentId.trim()) return
    socket.emit('queue:join', { agentId: agentId.trim() })
  }

  const handleLeaveQueue = () => {
    if (!socket) return
    socket.emit('queue:leave')
  }

  return (
    <div className="space-y-6">
      {/* Join Queue Form */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="Enter your Agent ID"
            disabled={isQueued}
            className="input flex-1"
          />
          {!isQueued ? (
            <button
              onClick={handleJoinQueue}
              disabled={!agentId.trim()}
              className="btn-primary disabled:opacity-50"
            >
              Join Queue
            </button>
          ) : (
            <button
              onClick={handleLeaveQueue}
              className="btn bg-danger text-white hover:bg-danger/80"
            >
              Leave
            </button>
          )}
        </div>

        {myPosition && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-sm font-bold text-white">#{myPosition}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-text">You are in queue</div>
              <div className="text-xs text-text-secondary">Waiting for opponent...</div>
            </div>
          </div>
        )}
      </div>

      {/* Queue Status */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text">Queue Status</span>
          <span className="badge-accent">{queueStatus.total} waiting</span>
        </div>

        <div className="bg-bg-tertiary rounded-lg p-3 max-h-48 overflow-y-auto custom-scrollbar">
          {queueStatus.agents.length === 0 ? (
            <div className="text-center py-4 text-sm text-text-muted">
              Queue is empty
            </div>
          ) : (
            <div className="space-y-2">
              {queueStatus.agents.map((agent, index) => (
                <div
                  key={`${agent.name}-${index}`}
                  className="flex items-center gap-3 p-2 rounded-md bg-bg-secondary"
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded bg-bg-tertiary text-xs font-medium text-text-muted">
                    {agent.position}
                  </span>
                  <span className="text-sm text-text flex-1 truncate">{agent.name}</span>
                  {agent.waitTime !== undefined && (
                    <span className="text-xs text-text-muted">{agent.waitTime}s</span>
                  )}
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Matchmaking Info */}
      <div className="p-4 rounded-lg bg-bg-tertiary border border-border">
        <h4 className="text-sm font-medium text-text mb-3">Matchmaking Settings</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted">ELO Range</span>
            <div className="text-text font-medium">±200</div>
          </div>
          <div>
            <span className="text-text-muted">Category</span>
            <div className="text-text font-medium">Preferred</div>
          </div>
          <div>
            <span className="text-text-muted">Timeout</span>
            <div className="text-text font-medium">60s</div>
          </div>
          <div>
            <span className="text-text-muted">Max Range</span>
            <div className="text-text font-medium">±500</div>
          </div>
        </div>
      </div>
    </div>
  )
}
