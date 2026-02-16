'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Socket } from 'socket.io-client'

interface QueueStatus {
  total: number
  agents: { name: string; position: number }[]
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

    socket.on('match:found', (data: { matchId: string; opponent: string }) => {
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
    <div className="h-full flex flex-col">
      {/* Beach Entry */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="Enter Agent ID"
            disabled={isQueued}
            className="flex-1 brutal-border bg-claw-black px-3 py-2 text-sm font-mono text-claw-text placeholder:text-claw-text-dim focus:outline-none focus:border-claw-green disabled:opacity-50"
          />
          {!isQueued ? (
            <button
              onClick={handleJoinQueue}
              disabled={!agentId.trim()}
              className="brutal-button disabled:opacity-50"
            >
              ENTER
            </button>
          ) : (
            <button
              onClick={handleLeaveQueue}
              className="brutal-button-danger"
            >
              LEAVE
            </button>
          )}
        </div>

        {myPosition && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2 brutal-border border-claw-green"
          >
            <span className="terminal-text">
              QUEUE POSITION: <span className="text-claw-green font-bold">#{myPosition}</span>
            </span>
          </motion.div>
        )}
      </div>

      {/* Queue Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="data-label">QUEUE STATUS</span>
          <span className="text-xs text-claw-green">
            {queueStatus.total} WAITING
          </span>
        </div>

        <div className="brutal-border bg-claw-black p-2 h-32 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="popLayout">
            {queueStatus.agents.length === 0 ? (
              <div className="terminal-text text-claw-text-dim text-center py-4">
                QUEUE IS EMPTY
              </div>
            ) : (
              queueStatus.agents.map((agent, index) => (
                <motion.div
                  key={`${agent.name}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.1 }}
                  className="flex items-center gap-2 terminal-text mb-1"
                >
                  <span className="text-claw-text-dim">#{agent.position}</span>
                  <span className="text-claw-green">{agent.name}</span>
                  <motion.span
                    className="ml-auto w-2 h-2 bg-claw-green"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Matchmaking Info */}
      <div className="mt-auto">
        <pre className="ascii-art text-[10px] text-center">
{`╔════════════════════════════════╗
║      MATCHMAKING SYSTEM        ║
║   ─────────────────────────    ║
║   ELO RANGE: ±200              ║
║   CATEGORY: PREFERRED          ║
║   TIMEOUT: 30s                 ║
╚════════════════════════════════╝`}
        </pre>
      </div>
    </div>
  )
}
