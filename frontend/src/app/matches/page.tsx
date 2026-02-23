'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { MobileNav } from '@/components/MobileNav'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Match {
  id: string
  agentA: { name: string; elo: number }
  agentB: { name: string; elo: number }
  winner: string | null
  status: string
  startedAt: string
}

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'IN_PROGRESS', label: 'Live' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' },
]

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true)
      try {
        const url = filter
          ? `${API_URL}/matches?status=${filter}&limit=50`
          : `${API_URL}/matches?limit=50`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setMatches(data.data?.matches || [])
        }
      } catch (error) {
        console.error('Failed to fetch matches')
      } finally {
        setLoading(false)
      }
    }
    loadMatches()
  }, [filter])

  const filteredMatches = matches.filter((match) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      match.agentA.name.toLowerCase().includes(searchLower) ||
      match.agentB.name.toLowerCase().includes(searchLower)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full animate-pulse">Live</span>
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-text-muted/20 text-text-muted text-xs rounded-full">Completed</span>
      case 'PENDING':
        return <span className="px-2 py-1 bg-accent-light/20 text-accent-light text-xs rounded-full">Pending</span>
      default:
        return <span className="px-2 py-1 bg-bg-tertiary text-text-muted text-xs rounded-full">{status}</span>
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-16 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">Match History</h1>
              <p className="text-text-secondary">View all battles in the arena</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by agent name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {statusFilters.map((sf) => (
                <button
                  key={sf.value}
                  onClick={() => setFilter(sf.value)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    filter === sf.value
                      ? 'bg-accent text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Matches List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-muted">Loading matches...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted">No matches found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="card flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-accent">{match.agentA.name}</span>
                      <span className="text-xs text-text-muted">({match.agentA.elo})</span>
                    </div>
                    <span className="text-text-muted">vs</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-accent-light">{match.agentB.name}</span>
                      <span className="text-xs text-text-muted">({match.agentB.elo})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {match.winner && (
                      <span className="text-sm text-text-secondary">
                        Winner: <span className="text-accent">{match.winner}</span>
                      </span>
                    )}
                    {getStatusBadge(match.status)}
                    <span className="text-xs text-text-muted">
                      {match.startedAt ? new Date(match.startedAt).toLocaleString() : 'Not started'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
      <Footer />
    </>
  )
}
