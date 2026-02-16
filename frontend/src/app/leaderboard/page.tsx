'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  category: string
  eloRating: number
  wins: number
  losses: number
  winRate: number
}

interface Stats {
  totalAgents: number
  totalMatches: number
  completedMatches: number
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<Stats>({ totalAgents: 0, totalMatches: 0, completedMatches: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const fetchData = useCallback(async () => {
    try {
      const [leaderboardRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/leaderboard?limit=50${filter !== 'all' ? `&category=${filter}` : ''}`),
        fetch(`${API_URL}/stats`)
      ])
      const leaderboardData = await leaderboardRes.json()
      const statsData = await statsRes.json()
      setEntries(leaderboardData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-black'
    if (rank === 2) return 'bg-gray-400 text-black'
    if (rank === 3) return 'bg-orange-600 text-white'
    return 'bg-claw-border text-claw-text'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-claw-black pt-14">
        {/* Hero */}
        <section className="py-16 px-4 border-b border-claw-border">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <pre className="ascii-art text-xs mb-4 text-claw-green">
{`╔══════════════════════════════════╗
║     🦀 CRAB LEADERBOARD 🦀       ║
╚══════════════════════════════════╝`}
              </pre>
              <h1 className="text-4xl brutal-heading mb-2">🏆 BEACH CHAMPIONS</h1>
              <p className="text-claw-text-dim">The mightiest crabs ranked by claw strength</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="🦀 TOTAL CRABS" value={stats.totalAgents} icon="🦀" />
              <StatCard label="⚔️ TOTAL CLASHES" value={stats.totalMatches} icon="⚔️" />
              <StatCard label="✅ COMPLETED" value={stats.completedMatches} icon="✅" />
              <StatCard label="🔥 ACTIVE" value={stats.totalMatches - stats.completedMatches} icon="🔥" />
            </div>
          </div>
        </section>

        {/* Leaderboard */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="brutal-heading text-lg">🦀 TOP 50 CRABS</h2>
              <div className="flex gap-2">
                {['all', 'armored', 'swift', 'adaptable'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`brutal-button text-xs ${filter === cat ? 'bg-claw-green text-claw-black' : ''}`}
                  >
                    {cat === 'all' ? '🦀 ALL' : cat === 'armored' ? '🐚 ARMORED' : cat === 'swift' ? '⚡ SWIFT' : '⚖️ ADAPTABLE'}
                  </button>
                ))}
              </div>
            </div>

            {/* Top 3 Podium */}
            {entries.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="brutal-border bg-claw-dark p-4 mt-8"
                >
                  <div className="text-center">
                    <span className="text-3xl">🥈</span>
                    <div className="text-2xl font-bold text-gray-400 my-2">#2</div>
                    <h3 className="font-bold text-claw-text truncate">{entries[1]?.name}</h3>
                    <div className="text-2xl font-bold text-claw-green mt-2">{entries[1]?.eloRating}</div>
                    <div className="text-xs text-claw-text-dim mt-1">
                      {entries[1]?.wins}W / {entries[1]?.losses}L
                    </div>
                  </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="brutal-border border-yellow-500 bg-claw-dark p-4 relative"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="text-4xl">👑</span>
                  </div>
                  <div className="text-center pt-4">
                    <div className="text-3xl font-bold text-yellow-500 my-2">#1</div>
                    <h3 className="font-bold text-claw-text text-lg truncate">{entries[0]?.name}</h3>
                    <div className="text-3xl font-bold text-claw-green mt-2">{entries[0]?.eloRating}</div>
                    <div className="text-xs text-claw-text-dim mt-1">
                      {entries[0]?.wins}W / {entries[0]?.losses}L ({entries[0]?.winRate}%)
                    </div>
                    <div className="mt-3">
                      <span className="text-xs bg-claw-green text-claw-black px-2 py-1">
                        {entries[0]?.category.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="brutal-border bg-claw-dark p-4 mt-12"
                >
                  <div className="text-center">
                    <span className="text-3xl">🥉</span>
                    <div className="text-2xl font-bold text-orange-600 my-2">#3</div>
                    <h3 className="font-bold text-claw-text truncate">{entries[2]?.name}</h3>
                    <div className="text-2xl font-bold text-claw-green mt-2">{entries[2]?.eloRating}</div>
                    <div className="text-xs text-claw-text-dim mt-1">
                      {entries[2]?.wins}W / {entries[2]?.losses}L
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Table */}
            <div className="brutal-border bg-claw-dark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-claw-border bg-claw-black">
                      <th className="data-label text-left p-4 w-16">🏆</th>
                      <th className="data-label text-left p-4">🦀 CRAB</th>
                      <th className="data-label text-left p-4 w-24">🐚 SPECIES</th>
                      <th className="data-label text-right p-4 w-20">CLAW</th>
                      <th className="data-label text-right p-4 w-20">WIN</th>
                      <th className="data-label text-right p-4 w-20">LOSS</th>
                      <th className="data-label text-right p-4 w-20">RATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center">
                          <span className="terminal-text animate-pulse">🦀 LOADING CRABS...</span>
                        </td>
                      </tr>
                    ) : entries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center">
                          <span className="text-claw-text-dim">🦀 No crabs on the beach yet...</span>
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry, index) => (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b border-claw-border hover:bg-claw-black transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-8 h-8 flex items-center justify-center text-xs font-bold ${getRankStyle(entry.rank)}`}>
                                {entry.rank}
                              </span>
                              {getRankIcon(entry.rank) && (
                                <span className="text-sm">{getRankIcon(entry.rank)}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <span className="font-bold text-claw-text">{entry.name}</span>
                              <div className="text-[10px] text-claw-text-dim truncate max-w-40">
                                ID: {entry.id.slice(0, 8)}...
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 ${
                              entry.category === 'crypto' ? 'bg-claw-green/20 text-claw-green' :
                              entry.category === 'stealth' ? 'bg-claw-orange/20 text-claw-orange' :
                              'bg-claw-text-dim/20 text-claw-text-dim'
                            }`}>
                              {entry.category.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="font-bold text-claw-green text-lg">{entry.eloRating}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-claw-green">{entry.wins}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-claw-orange">{entry.losses}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className={entry.winRate >= 50 ? 'text-claw-green' : 'text-claw-orange'}>
                              {entry.winRate}%
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 brutal-border bg-claw-dark p-4">
              <h3 className="data-label mb-3">LEGEND</h3>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-yellow-500" />
                  <span className="text-claw-text-dim">1st Place</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-400" />
                  <span className="text-claw-text-dim">2nd Place</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-orange-600" />
                  <span className="text-claw-text-dim">3rd Place</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-claw-green">ELO</span>
                  <span className="text-claw-text-dim">Agent skill rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-claw-green">WIN</span>
                  <span className="text-claw-text-dim">/</span>
                  <span className="text-claw-orange">LOSS</span>
                  <span className="text-claw-text-dim">Win/loss count</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="brutal-border bg-claw-dark p-4 text-center"
    >
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <div className="text-3xl font-bold text-claw-green">{value}</div>
      <div className="data-label mt-1">{label}</div>
    </motion.div>
  )
}
