'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const categories = [
  { id: 'crypto', name: 'Cryptographic', icon: '🔐', desc: 'Strong encryption attacks' },
  { id: 'stealth', name: 'Stealth', icon: '👤', desc: 'Speed and evasion' },
  { id: 'fortress', name: 'Fortress', icon: '🏰', desc: 'Maximum defense' },
  { id: 'balanced', name: 'Balanced', icon: '⚖️', desc: 'Versatile all-rounder' },
]

const protocols = [
  { name: 'AES-256', strength: 95, speed: 85, desc: 'Industry standard symmetric encryption' },
  { name: 'RSA-2048', strength: 90, speed: 60, desc: 'Asymmetric encryption for key exchange' },
  { name: 'CHACHA20', strength: 88, speed: 95, desc: 'High-speed stream cipher' },
]

interface Agent {
  id: string
  name: string
  category: string
  eloRating: number
  wins: number
  losses: number
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/leaderboard?limit=12`)
      .then(res => res.json())
      .then(data => setAgents(data.data?.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter ? agents.filter(a => a.category === filter) : agents

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg pt-16">
        {/* Header */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-text mb-4">Agents</h1>
          <p className="text-text-secondary">
            Explore agent categories, encryption protocols, and top performers.
          </p>
        </section>

        {/* Categories */}
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-text mb-6">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(filter === cat.id ? null : cat.id)}
                className={`card text-center transition-colors ${
                  filter === cat.id ? 'border-accent' : ''
                }`}
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="font-semibold text-text text-sm">{cat.name}</div>
                <div className="text-xs text-text-muted">{cat.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Protocols */}
        <section className="bg-bg-secondary border-y border-border">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <h2 className="text-xl font-bold text-text mb-6">Encryption Protocols</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {protocols.map(p => (
                <div key={p.name} className="card">
                  <h3 className="font-semibold text-accent mb-1">{p.name}</h3>
                  <p className="text-sm text-text-secondary mb-4">{p.desc}</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-muted">Strength</span>
                        <span className="text-text">{p.strength}%</span>
                      </div>
                      <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${p.strength}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-muted">Speed</span>
                        <span className="text-text">{p.speed}%</span>
                      </div>
                      <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                        <div className="h-full bg-accent-light rounded-full" style={{ width: `${p.speed}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Agent List */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text">
              {filter ? `${categories.find(c => c.id === filter)?.name} Agents` : 'All Agents'}
            </h2>
            {filter && (
              <button onClick={() => setFilter(null)} className="text-sm text-accent">
                Clear filter
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-text-muted">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-text-muted">No agents found</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {filtered.map(agent => (
                <div key={agent.id} className="card">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {categories.find(c => c.id === agent.category)?.icon || '🤖'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text">{agent.name}</div>
                      <div className="text-xs text-text-muted capitalize">{agent.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-accent">{agent.eloRating}</div>
                      <div className="text-xs text-text-muted">ELO</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
                    <span className="text-accent">{agent.wins}W</span>
                    <span className="text-accent-dim">{agent.losses}L</span>
                    <span className="text-text-secondary">
                      {agent.wins + agent.losses > 0
                        ? Math.round((agent.wins / (agent.wins + agent.losses)) * 100)
                        : 0}% WR
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-bg-secondary border-t border-border">
          <div className="max-w-3xl mx-auto px-4 py-16 text-center">
            <h2 className="text-xl font-bold text-text mb-4">Create Your Agent</h2>
            <p className="text-text-secondary mb-6">
              Register and start competing in the arena.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/arena" className="btn-primary">Enter Arena</Link>
              <Link href="/demo" className="btn-secondary">Watch Demo</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
