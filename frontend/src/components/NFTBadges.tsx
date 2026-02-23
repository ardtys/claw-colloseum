'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  requirement: string
  unlocked: boolean
}

const BADGES: Badge[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Win your first battle',
    icon: '⚔️',
    rarity: 'common',
    requirement: '1 win',
    unlocked: false,
  },
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Win 10 battles',
    icon: '🛡️',
    rarity: 'common',
    requirement: '10 wins',
    unlocked: false,
  },
  {
    id: 'gladiator',
    name: 'Gladiator',
    description: 'Win 50 battles',
    icon: '🏛️',
    rarity: 'rare',
    requirement: '50 wins',
    unlocked: false,
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Reach top 10 on leaderboard',
    icon: '🏆',
    rarity: 'epic',
    requirement: 'Top 10 rank',
    unlocked: false,
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Reach #1 on leaderboard',
    icon: '👑',
    rarity: 'legendary',
    requirement: '#1 rank',
    unlocked: false,
  },
  {
    id: 'crypto-master',
    name: 'Crypto Master',
    description: 'Win 25 battles using AES-256',
    icon: '🔐',
    rarity: 'rare',
    requirement: '25 AES-256 wins',
    unlocked: false,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Win a battle in under 10 seconds',
    icon: '⚡',
    rarity: 'rare',
    requirement: '<10s win',
    unlocked: false,
  },
  {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: 'Win 10 battles without shield breach',
    icon: '🏰',
    rarity: 'epic',
    requirement: '10 flawless wins',
    unlocked: false,
  },
]

const RARITY_COLORS = {
  common: 'border-text-muted text-text-muted',
  rare: 'border-blue-500 text-blue-500',
  epic: 'border-purple-500 text-purple-500',
  legendary: 'border-yellow-500 text-yellow-500',
}

const RARITY_BG = {
  common: 'bg-text-muted/10',
  rare: 'bg-blue-500/10',
  epic: 'bg-purple-500/10',
  legendary: 'bg-yellow-500/10',
}

export function NFTBadges({ agentWins = 0 }: { agentWins?: number }) {
  const { isConnected } = useAccount()
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  // Determine which badges are unlocked based on wins
  const badgesWithStatus = BADGES.map((badge) => {
    let unlocked = false
    if (badge.id === 'first-blood' && agentWins >= 1) unlocked = true
    if (badge.id === 'warrior' && agentWins >= 10) unlocked = true
    if (badge.id === 'gladiator' && agentWins >= 50) unlocked = true
    return { ...badge, unlocked }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text">Achievement Badges</h3>
        <span className="text-xs text-text-muted">
          {badgesWithStatus.filter((b) => b.unlocked).length}/{badgesWithStatus.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {badgesWithStatus.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`relative p-3 rounded-lg border-2 transition-all ${
              badge.unlocked
                ? `${RARITY_COLORS[badge.rarity]} ${RARITY_BG[badge.rarity]} hover:scale-105`
                : 'border-border bg-bg-tertiary opacity-50'
            }`}
          >
            <div className="text-2xl mb-1">{badge.icon}</div>
            <div className="text-xs font-medium truncate">{badge.name}</div>
            {!badge.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-bg/80 rounded-lg">
                <span className="text-lg">🔒</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selected Badge Detail */}
      {selectedBadge && (
        <div className={`p-4 rounded-lg border-2 ${RARITY_COLORS[selectedBadge.rarity]} ${RARITY_BG[selectedBadge.rarity]}`}>
          <div className="flex items-start gap-3">
            <div className="text-4xl">{selectedBadge.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-text">{selectedBadge.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded capitalize ${RARITY_COLORS[selectedBadge.rarity]}`}>
                  {selectedBadge.rarity}
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-1">{selectedBadge.description}</p>
              <p className="text-xs text-text-muted mt-2">
                Requirement: {selectedBadge.requirement}
              </p>
              {selectedBadge.unlocked && isConnected && (
                <button className="btn-primary mt-3 text-xs">
                  Mint as NFT (Coming Soon)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!isConnected && (
        <p className="text-xs text-text-muted text-center">
          Connect wallet to mint badges as NFTs
        </p>
      )}
    </div>
  )
}

export function BadgeDisplay({ badges }: { badges: string[] }) {
  const displayBadges = BADGES.filter((b) => badges.includes(b.id))

  if (displayBadges.length === 0) return null

  return (
    <div className="flex gap-1">
      {displayBadges.slice(0, 3).map((badge) => (
        <span
          key={badge.id}
          title={badge.name}
          className={`w-6 h-6 flex items-center justify-center rounded border ${RARITY_COLORS[badge.rarity]} ${RARITY_BG[badge.rarity]}`}
        >
          {badge.icon}
        </span>
      ))}
      {displayBadges.length > 3 && (
        <span className="w-6 h-6 flex items-center justify-center rounded bg-bg-tertiary text-xs text-text-muted">
          +{displayBadges.length - 3}
        </span>
      )}
    </div>
  )
}
