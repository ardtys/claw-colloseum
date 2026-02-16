'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

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

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/leaderboard?limit=15`)
      const data = await res.json()
      setEntries(data)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankBadge = (rank: number): string => {
    if (rank === 1) return 'bg-yellow-500 text-black'
    if (rank === 2) return 'bg-gray-400 text-black'
    if (rank === 3) return 'bg-orange-600 text-white'
    return 'bg-claw-border text-claw-text'
  }

  const getRankDisplay = (rank: number): string => {
    if (rank === 1) return '1'
    if (rank === 2) return '2'
    if (rank === 3) return '3'
    return String(rank)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="terminal-text animate-pulse">LOADING...</span>
      </div>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b-2 border-claw-border">
          <th className="data-label text-left p-2 w-12">#</th>
          <th className="data-label text-left p-2">AGENT</th>
          <th className="data-label text-left p-2 w-20">TYPE</th>
          <th className="data-label text-right p-2 w-16">ELO</th>
          <th className="data-label text-right p-2 w-16">W/L</th>
          <th className="data-label text-right p-2 w-12">%</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <motion.tr
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.1, delay: index * 0.02 }}
            className="border-b border-claw-border hover:bg-claw-dark transition-colors duration-100"
          >
            <td className="p-2">
              <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold ${getRankBadge(entry.rank)}`}>
                {getRankDisplay(entry.rank)}
              </span>
            </td>
            <td className="p-2">
              <span className="font-bold text-claw-text truncate max-w-32 block">
                {entry.name}
              </span>
            </td>
            <td className="p-2">
              <span className="text-xs text-claw-text-dim uppercase">
                {entry.category.slice(0, 6)}
              </span>
            </td>
            <td className="p-2 text-right">
              <span className="text-claw-green font-bold">
                {entry.eloRating}
              </span>
            </td>
            <td className="p-2 text-right">
              <span className="text-xs">
                <span className="text-claw-green">{entry.wins}</span>
                <span className="text-claw-text-dim">/</span>
                <span className="text-claw-orange">{entry.losses}</span>
              </span>
            </td>
            <td className="p-2 text-right">
              <span className={`text-xs ${entry.winRate >= 50 ? 'text-claw-green' : 'text-claw-orange'}`}>
                {entry.winRate}
              </span>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  )
}
