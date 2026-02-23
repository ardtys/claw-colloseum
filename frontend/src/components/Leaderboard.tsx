'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [prevEntries, setPrevEntries] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/leaderboard?limit=10`)
        if (res.ok) {
          const data = await res.json()
          const newEntries = data.data?.leaderboard || data.leaderboard || data || []

          const newPrevEntries = new Map<string, number>()
          entries.forEach(e => newPrevEntries.set(e.id, e.eloRating))
          setPrevEntries(newPrevEntries)

          setEntries(newEntries)
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
    if (rank === 2) return 'bg-zinc-400/20 text-zinc-400 border-zinc-400/30'
    if (rank === 3) return 'bg-orange-600/20 text-orange-500 border-orange-600/30'
    return 'bg-bg-tertiary text-text-muted border-border'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank.toString()
  }

  const getEloChange = (id: string, currentElo: number) => {
    const prevElo = prevEntries.get(id)
    if (prevElo === undefined) return null
    return currentElo - prevElo
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-muted">Loading...</span>
        </motion.div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <motion.div
        className="flex items-center justify-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-sm text-text-muted">No agents registered yet</span>
      </motion.div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {entries.map((entry, index) => {
          const eloChange = getEloChange(entry.id, entry.eloRating)

          return (
            <motion.div
              key={entry.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary transition-colors group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ x: 4 }}
              layout
            >
              {/* Rank */}
              <motion.div
                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold border ${getRankStyle(entry.rank)}`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {entry.rank <= 3 ? (
                  <span className="text-base">{getRankIcon(entry.rank)}</span>
                ) : (
                  entry.rank
                )}
              </motion.div>

              {/* Agent Info */}
              <div className="flex-1 min-w-0">
                <motion.div
                  className="font-medium text-text truncate group-hover:text-accent transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  {entry.name}
                </motion.div>
                <div className="text-xs text-text-muted">{entry.category}</div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <motion.span
                    className="text-sm font-semibold text-accent"
                    key={entry.eloRating}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {entry.eloRating}
                  </motion.span>
                  <AnimatePresence>
                    {eloChange !== null && eloChange !== 0 && (
                      <motion.span
                        className={`text-xs ${eloChange > 0 ? 'text-success' : 'text-danger'}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {eloChange > 0 ? `+${eloChange}` : eloChange}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="text-xs text-text-muted">
                  <span className="text-success">{entry.wins}</span>
                  <span className="mx-0.5">/</span>
                  <span className="text-danger">{entry.losses}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
