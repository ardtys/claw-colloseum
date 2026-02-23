'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { MobileNav } from '@/components/MobileNav'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Agent {
  id: string
  name: string
  category: string
  eloRating: number
  wins: number
  losses: number
  winRate: number
  totalGames: number
  hasShield: boolean
  recentMatches: {
    id: string
    status: string
    startedAt: string
    won: boolean
  }[]
}

export default function AgentProfilePage() {
  const params = useParams()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchAgent(params.id as string)
    }
  }, [params.id])

  const fetchAgent = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/agents/${id}`)
      if (!res.ok) throw new Error('Agent not found')
      const data = await res.json()
      setAgent(data.data || data)
    } catch (err) {
      setError('Agent not found')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crypto': return '🔐'
      case 'stealth': return '👤'
      case 'fortress': return '🏰'
      case 'balanced': return '⚖️'
      default: return '🤖'
    }
  }

  const shareOnTwitter = () => {
    if (!agent) return
    const text = `Check out ${agent.name} on Claw Colosseum! ELO: ${agent.eloRating} | Win Rate: ${agent.winRate}%`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-16 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-muted">Loading agent...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-accent-dim text-lg mb-4">{error}</p>
              <Link href="/agents" className="btn-secondary">Back to Agents</Link>
            </div>
          ) : agent ? (
            <>
              {/* Header */}
              <div className="card mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{getCategoryIcon(agent.category)}</div>
                    <div>
                      <h1 className="text-2xl font-bold text-text">{agent.name}</h1>
                      <p className="text-text-muted capitalize">{agent.category} Agent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={shareOnTwitter}
                      className="px-4 py-2 bg-bg-tertiary text-text-secondary text-sm rounded-lg hover:bg-border transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Share
                    </button>
                    {agent.hasShield && (
                      <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">
                        Shield Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card text-center">
                  <div className="text-3xl font-bold text-accent">{agent.eloRating}</div>
                  <div className="text-sm text-text-muted">ELO Rating</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-text">{agent.totalGames}</div>
                  <div className="text-sm text-text-muted">Total Games</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-accent">{agent.wins}</div>
                  <div className="text-sm text-text-muted">Wins</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-accent-dim">{agent.losses}</div>
                  <div className="text-sm text-text-muted">Losses</div>
                </div>
              </div>

              {/* Win Rate */}
              <div className="card mb-6">
                <h2 className="font-semibold text-text mb-4">Win Rate</h2>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-4 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${agent.winRate}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-accent">{agent.winRate}%</span>
                </div>
              </div>

              {/* Recent Matches */}
              <div className="card">
                <h2 className="font-semibold text-text mb-4">Recent Matches</h2>
                {agent.recentMatches.length === 0 ? (
                  <p className="text-text-muted text-center py-8">No matches yet</p>
                ) : (
                  <div className="space-y-2">
                    {agent.recentMatches.map((match) => (
                      <Link
                        key={match.id}
                        href={`/matches/${match.id}`}
                        className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${match.won ? 'bg-accent' : 'bg-accent-dim'}`} />
                          <span className="text-sm text-text">{match.won ? 'Victory' : 'Defeat'}</span>
                        </div>
                        <span className="text-xs text-text-muted">
                          {new Date(match.startedAt).toLocaleDateString()}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </main>
      <MobileNav />
      <Footer />
    </>
  )
}
