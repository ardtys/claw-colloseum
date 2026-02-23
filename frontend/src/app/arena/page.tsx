'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal } from '@/components/Terminal'
import { BattleStream } from '@/components/BattleStream'
import { Leaderboard } from '@/components/Leaderboard'
import { AgentCard } from '@/components/AgentCard'
import { MatchQueue } from '@/components/MatchQueue'
import { useSocket } from '@/hooks/useSocket'
import { useBattleState } from '@/hooks/useBattleState'
import { FadeIn, ScaleOnHover } from '@/components/animations'

export default function ArenaDashboard() {
  const { socket, isConnected } = useSocket()
  const { battleState, events } = useBattleState(socket)
  const [activeView, setActiveView] = useState<'battle' | 'queue'>('battle')

  return (
    <main className="min-h-screen bg-bg">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center group">
              <motion.div
                className="relative w-10 h-10 rounded-lg overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src="/logo.png"
                  alt="Claw Colosseum"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </Link>

            <div className="hidden sm:block h-4 w-px bg-border" />

            <div className="flex items-center gap-2 text-sm">
              <motion.span
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-danger'}`}
                animate={isConnected ? {
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-text-secondary">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setActiveView('battle')}
              className={`btn ${activeView === 'battle' ? 'btn-primary' : 'btn-ghost'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Battle
            </motion.button>
            <motion.button
              onClick={() => setActiveView('queue')}
              className={`btn ${activeView === 'queue' ? 'btn-primary' : 'btn-ghost'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Queue
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Battle View */}
          <div className="lg:col-span-2 space-y-6">
            {/* Battle Section */}
            <FadeIn delay={0.1}>
              <motion.section
                className="card"
                whileHover={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-text">
                      {activeView === 'battle' ? 'Live Battle' : 'Match Queue'}
                    </h2>
                    <AnimatePresence>
                      {battleState.matchId && (
                        <motion.span
                          className="badge-warning"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <motion.span
                            className="inline-block w-2 h-2 bg-warning rounded-full mr-2"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          Match in Progress
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  {battleState.round && battleState.round !== 'JUDGMENT' && (
                    <motion.span
                      className="text-sm text-text-secondary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Round: <span className="text-accent font-medium">{battleState.round}</span>
                    </motion.span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {activeView === 'battle' ? (
                    <motion.div
                      key="battle"
                      className="min-h-[300px]"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BattleStream
                        agentA={battleState.agentA}
                        agentB={battleState.agentB}
                        currentRound={battleState.round}
                        events={events.slice(-5)}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="queue"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MatchQueue socket={socket} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Health Bars */}
                <AnimatePresence>
                  {battleState.matchId && (
                    <motion.div
                      className="mt-6 pt-6 border-t border-border space-y-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HealthDisplay
                        name={battleState.agentA?.name || 'Agent A'}
                        health={battleState.agentA?.health || 100}
                        integrity={battleState.agentA?.integrity || 100}
                        side="A"
                      />
                      <HealthDisplay
                        name={battleState.agentB?.name || 'Agent B'}
                        health={battleState.agentB?.health || 100}
                        integrity={battleState.agentB?.integrity || 100}
                        side="B"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            </FadeIn>

            {/* Agent Specs */}
            <FadeIn delay={0.2}>
              <section className="card">
                <h2 className="text-lg font-semibold text-text mb-4">Agent Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <AgentCard
                      agent={battleState.agentA}
                      side="A"
                      isActive={battleState.round !== 'JUDGMENT'}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <AgentCard
                      agent={battleState.agentB}
                      side="B"
                      isActive={battleState.round !== 'JUDGMENT'}
                    />
                  </motion.div>
                </div>
              </section>
            </FadeIn>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Moltbook Log */}
            <FadeIn delay={0.3}>
              <motion.section
                className="card"
                whileHover={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text">Battle Log</h2>
                  <motion.span
                    className="text-sm text-text-muted"
                    key={events.length}
                    initial={{ scale: 1.2, color: '#f97316' }}
                    animate={{ scale: 1, color: '#71717a' }}
                    transition={{ duration: 0.3 }}
                  >
                    {events.length} events
                  </motion.span>
                </div>
                <div className="h-[300px]">
                  <Terminal events={events} />
                </div>
              </motion.section>
            </FadeIn>

            {/* Leaderboard */}
            <FadeIn delay={0.4}>
              <motion.section
                className="card"
                whileHover={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text">Top Agents</h2>
                  <ScaleOnHover scale={1.05}>
                    <Link href="/leaderboard" className="text-sm text-accent hover:text-accent-light transition-colors">
                      View All →
                    </Link>
                  </ScaleOnHover>
                </div>
                <div className="max-h-[300px] overflow-auto custom-scrollbar">
                  <Leaderboard />
                </div>
              </motion.section>
            </FadeIn>
          </div>
        </div>
      </div>
    </main>
  )
}

function HealthDisplay({
  name,
  health,
  integrity,
  side,
}: {
  name: string
  health: number
  integrity: number
  side: 'A' | 'B'
}) {
  const healthColor = health > 60 ? 'bg-success' : health > 30 ? 'bg-warning' : 'bg-danger'
  const integrityColor = integrity > 60 ? 'bg-success' : integrity > 30 ? 'bg-warning' : 'bg-danger'
  const sideColor = side === 'A' ? 'text-accent' : 'text-success'

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${sideColor}`}>{name}</span>
        <span className="text-xs text-text-muted">HP: {health} | INT: {integrity}</span>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="health-bar">
            <motion.div
              className={`health-bar-fill ${healthColor}`}
              initial={{ width: '100%' }}
              animate={{ width: `${health}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="health-bar">
            <motion.div
              className={`health-bar-fill ${integrityColor}`}
              initial={{ width: '100%' }}
              animate={{ width: `${integrity}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
